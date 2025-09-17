import { serve } from "std/http/server.ts";
import { Resend } from "resend"; 

const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("CRITICAL: RESEND_API_KEY is not set in environment variables.");
}
const resend = new Resend(resendApiKey!);

serve(async (req) => {
  try {
    if (!resendApiKey) {
      throw new Error("Email provider (Resend) is not configured on the server.");
    }

    const { record: order } = await req.json();

    if (!order || !order.user_id || !order.grand_total) {
      throw new Error("Invalid order data received from the trigger.");
    }
    
    const userResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users/${order.user_id}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        },
      }
    );

    if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(`Failed to fetch user data: ${errorData.msg || userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      throw new Error(`Could not find an email for user ID: ${order.user_id}`);
    }

    const { data, error } = await resend.emails.send({
      from: "AR Furniture <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Your AR Furniture Order Confirmation #${order.id}`,
      html: `
        <h1>Thank You for Your Order!</h1>
        <p>Hi ${order.name},</p>
        <p>We've received your order and are getting it ready for shipment. Here are the details:</p>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Total Amount:</strong> Rs ${order.grand_total}</p>
        <p><strong>Shipping to:</strong> ${order.address}</p>
        <h3>Products Ordered:</h3>
        <ul>
          ${order.products.map(p => `<li>${p.name} - Rs ${p.price}</li>`).join('')}
        </ul>
        <p>We'll notify you again once your order has shipped.</p>
        <p>Thanks,<br/>The AR Furniture Team</p>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: "Email sent successfully!" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});