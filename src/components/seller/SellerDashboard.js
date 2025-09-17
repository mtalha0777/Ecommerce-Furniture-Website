import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddProductModal from "../product/AddProductModal";
import EditProductModal from "../product/EditProductModal";
import ViewProductModal from "../product/ViewProductModal";
import ProductImageSlider from "../product/ProductImageSlider";
// Icons
import {
  FaStore,
  FaBox,
  FaShoppingCart,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};
const SellerDashboard = () => {
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

 
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // --- THEME COLORS ---
  const theme = {
    background: "#F5EFE6",
    containerBackground: "#FFFFFF",
    primaryText: "#5D4037",
    secondaryText: "#8D6E63",
    accent: "#8D6E63",
    lightBorder: "#D7CCC8",
    success: "#4CAF50",
    danger: "#f44336",
    info: "#2196f3",
    warning: "#ff9800",
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please login first");
          navigate("/");
          return;
        }

        // Fetch shop data
        const { data: shop } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single();
        if (!shop) {
          toast("Welcome! Please create your shop to get started.");
          navigate("/shopdetails");
          return;
        }
        setShopData(shop);

        // Fetch products
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("shop_id", shop.id);
        const validProducts = productsData || [];
        setProducts(validProducts);

        // Fetch orders that contain products from this shop
        const productIds = validProducts.map((p) => p.id);
        let shopOrders = [];
        let totalRevenue = 0;

        if (productIds.length > 0) {
          // Get all orders
          const { data: allOrders, error: ordersError } = await supabase
            .from("orders")
            .select("*");

          if (ordersError) {
            console.error("Error fetching orders:", ordersError);
          } else {
            // Filter orders that contain products from this shop
            shopOrders = (allOrders || []).filter((order) => {
              if (!order.products || !Array.isArray(order.products))
                return false;
              return order.products.some((product) =>
                productIds.includes(product.product_id)
              );
            });
          }
        }

        setOrders(shopOrders);
        setStats({
          totalProducts: validProducts.length,
          totalOrders: shopOrders.length,
          totalRevenue: totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Could not load your dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  // --- HANDLERS FOR MODALS ---
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  // --- DELETE PRODUCT ---
  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this product?"
      )
    )
      return;

    const loadingToast = toast.loading("Deleting product...");

    try {
      // First check if the product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", productId)
        .single();

      if (checkError) {
        throw new Error(`Cannot find product: ${checkError.message}`);
      }

      if (!existingProduct) {
        throw new Error("Product not found in database");
      }

      // Now delete the product
      const { data, error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .select(); // This will return the deleted row

      if (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message}`);
      }

      // Check if anything was actually deleted
      if (!data || data.length === 0) {
        throw new Error(
          "No rows were deleted. Product might not exist or you don't have permission."
        );
      }

      // Update local state only if deletion was successful
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      setStats((prev) => ({ ...prev, totalProducts: updatedProducts.length }));

      toast.success(`Product "${existingProduct.name}" deleted successfully`, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(`Failed to delete product: ${error.message}`, {
        id: loadingToast,
      });

      // Log detailed error information
      console.error("Delete Product Error Details:", {
        productId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    setStats((prev) => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  const handleProductUpdated = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };
  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: theme.background,
      padding: isMobile ? "10px" : isTablet ? "15px" : "30px",
    },

    // Shop Info
    shopInfoCard: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      padding: isMobile ? "15px" : "25px",
      marginBottom: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      flexDirection: isMobile ? "column" : "row",
      gap: "20px",
      textAlign: isMobile ? "center" : "left",
    },
    shopAvatar: {
      width: isMobile ? 60 : 80,
      height: isMobile ? 60 : 80,
      borderRadius: "50%",
      objectFit: "cover",
      border: `2px solid ${theme.lightBorder}`,
    },
    shopTitle: {
      fontSize: isMobile ? "1.4rem" : "2rem",
      fontWeight: "bold",
      color: theme.primaryText,
    },
    shopLocation: {
      color: theme.secondaryText,
      display: "flex",
      alignItems: "center",
      gap: "5px",
      marginTop: "5px",
      justifyContent: isMobile ? "center" : "flex-start",
    },

    // Stats
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "1fr 1fr"
        : "repeat(3, 1fr)",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      backgroundColor: theme.containerBackground,
      padding: isMobile ? "15px" : "25px",
      borderRadius: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      justifyContent: "center",
    },
    statIcon: { fontSize: isMobile ? "2rem" : "2.5rem", color: theme.accent },
    statValue: {
      fontSize: isMobile ? "1.5rem" : "2rem",
      fontWeight: "bold",
      color: theme.primaryText,
    },
    statTitle: {
      color: theme.secondaryText,
      marginTop: "5px",
      fontSize: "0.9rem",
    },

    // Tabs
    tabContainer: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    tabHeader: {
      display: "flex",
      flexWrap: "wrap",
      borderBottom: `1px solid ${theme.lightBorder}`,
      overflowX: "auto",
    },
    tab: {
      padding: isMobile ? "12px 15px" : "20px 30px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      fontSize: isMobile ? "0.95rem" : "1.1rem",
      fontWeight: "500",
      color: theme.secondaryText,
      borderBottomWidth: "3px",
      borderBottomStyle: "solid",
      borderBottomColor: "transparent",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    },
    activeTab: { color: theme.primaryText, borderBottomColor: theme.accent },
    tabContent: { padding: isMobile ? "15px" : "30px" },

    // Products
    addProductBtn: {
      backgroundColor: theme.accent,
      color: "white",
      border: "none",
      padding: isMobile ? "12px 20px" : "15px 30px",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginBottom: "20px",
      width: isMobile ? "100%" : "auto",
    },
    productsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
    },
    productCard: {
      backgroundColor: "#fdfdfd",
      borderRadius: "10px",
      overflow: "hidden",
      border: `1px solid ${theme.lightBorder}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
    },
    productImageContainer: {
      width: "100%",
      height: "200px",
      overflow: "hidden",
    },
    productImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.3s ease",
    },
    noImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#EFEBE9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "3rem",
      color: theme.lightBorder,
    },
    productInfo: {
      padding: "15px",
      flex: "1",
      display: "flex",
      flexDirection: "column",
    },
    productName: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      marginBottom: "5px",
      color: theme.primaryText,
    },
    productPrice: {
      fontSize: "1rem",
      fontWeight: "bold",
      color: theme.success,
    },
    productDescription: {
      color: theme.secondaryText,
      fontSize: "0.85rem",
      margin: "10px 0",
      flex: "1",
    },
    productActions: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "10px 15px",
      borderTop: `1px solid ${theme.lightBorder}`,
      gap: "10px",
    },
    actionBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1.2rem",
      color: theme.secondaryText,
      transition: "color 0.2s ease-in-out",
    },
    // Orders styles
    orderCard: {
      backgroundColor: "#fdfdfd",
      border: `1px solid ${theme.lightBorder}`,
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "15px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    orderHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      flexWrap: "wrap",
      gap: "10px",
    },
    orderId: {
      fontWeight: "bold",
      color: theme.primaryText,
    },
    orderDate: {
      color: theme.secondaryText,
      fontSize: "0.9rem",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    orderStatus: {
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      backgroundColor: theme.accent,
      color: "white",
    },
    orderCustomer: {
      color: theme.secondaryText,
      display: "flex",
      alignItems: "center",
      gap: "5px",
      marginBottom: "10px",
    },
    orderProducts: {
      marginTop: "10px",
    },
    orderProduct: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px 0",
      borderBottom: `1px solid ${theme.lightBorder}`,
    },
    orderTotal: {
      fontWeight: "bold",
      color: theme.success,
      fontSize: "1.1rem",
      marginTop: "10px",
      textAlign: "right",
    },

    // Others
    noData: {
      textAlign: "center",
      padding: "50px",
      color: theme.secondaryText,
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: theme.background,
    },
    spinner: {
      width: "50px",
      height: "50px",
      border: `5px solid ${theme.lightBorder}`,
      borderTop: `5px solid ${theme.accent}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

 
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
        <div style={styles.spinner}></div>
        <p style={{ color: theme.primaryText, marginTop: "20px" }}>
          Loading Your Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`.productCard:hover .productImg { transform: scale(1.05); }`}</style>

      {/* Shop Info */}
      <div style={styles.shopInfoCard}>
        {shopData?.profilePicture_url ? (
          <img
            src={shopData.profilePicture_url}
            alt={shopData.shopName}
            style={styles.shopAvatar}
          />
        ) : (
          <div style={styles.shopNoAvatar}>
            <FaStore style={{ fontSize: 32, color: theme.secondaryText }} />
          </div>
        )}
        <div>
          <h1 style={styles.shopTitle}>{shopData?.shopName}</h1>
          <p style={styles.shopLocation}>
            <FaMapMarkerAlt /> {shopData?.city}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FaBox style={styles.statIcon} />
          <div>
            <h3 style={styles.statValue}>{stats.totalProducts}</h3>
            <p style={styles.statTitle}>Total Products</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FaShoppingCart style={styles.statIcon} />
          <div>
            <h3 style={styles.statValue}>{stats.totalOrders}</h3>
            <p style={styles.statTitle}>Total Orders</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "overview" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "products" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("products")}
          >
            My Products ({products.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "orders" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("orders")}
          >
            Orders ({orders.length})
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === "overview" && (
            <div>
              <h2 style={{ color: theme.primaryText }}>Welcome back!</h2>
              <p style={{ color: theme.secondaryText }}>
                Here's a summary of your shop. You can manage everything from
                the tabs above.
              </p>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <button
                style={styles.addProductBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus /> Add New Product
              </button>
              {products.length === 0 ? (
                <div style={styles.noData}>
                  <p>
                    You haven't added any products yet. Click the button above
                    to get started!
                  </p>
                </div>
              ) : (
                <div style={styles.productsGrid}>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      style={styles.productCard}
                      className="productCard"
                    >
                      <div style={styles.productImageContainer}>
                                        
                                        <ProductImageSlider images={product.image_urls} isMobile={isMobile} />
                                    </div>
                      <div style={styles.productInfo}>
                        <h4 style={styles.productName}>{product.name}</h4>
                        <p style={styles.productPrice}>Rs. {product.price}</p>
                        <p style={styles.productDescription}>
                          {product.description?.substring(0, 80)}...
                        </p>
                      </div>
                      <div style={styles.productActions}>
                        <button
                          style={styles.actionBtn}
                          className="actionBtn-view"
                          onClick={() => handleOpenViewModal(product)}
                        >
                          <FaEye />
                        </button>
                        <button
                          style={styles.actionBtn}
                          className="actionBtn-edit"
                          onClick={() => handleOpenEditModal(product)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          style={styles.actionBtn}
                          className="actionBtn-delete"
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div style={styles.noData}>
                  <p>
                    Your customer orders will appear here once they are placed.
                  </p>
                </div>
              ) : (
                <div>
                  {orders.map((order) => {
                    // Filter products that belong to this shop
                    const shopProducts =
                      order.products?.filter((product) =>
                        products.some((p) => p.id === product.product_id)
                      ) || [];

                    const shopOrderTotal = shopProducts.reduce(
                      (sum, product) => sum + parseFloat(product.price || 0),
                      0
                    );
                    if (shopProducts.length === 0) return null;
                    return (
                      <div key={order.id} style={styles.orderCard}>
                        <div style={styles.orderHeader}>
                          <div style={styles.orderId}>Order #{order.id}</div>
                          <div style={styles.orderDate}>
                            <FaCalendarAlt />{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div style={styles.orderStatus}>{order.status}</div>
                        </div>

                        <div style={styles.orderCustomer}>
                          <FaUser /> {order.name}
                        </div>

                        <div style={styles.orderProducts}>
                          <strong>Your Products in this order:</strong>
                          {shopProducts.map((product, index) => (
                            <div key={index} style={styles.orderProduct}>
                              <span>{product.name}</span>
                              <span>Rs. {product.price}</span>
                            </div>
                          ))}
                        </div>

                        <div style={styles.orderTotal}>
                          Your Revenue: Rs. {shopOrderTotal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        theme={theme}
        isMobile={isMobile}
        onProductAdded={handleProductAdded}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
        theme={theme}
        isMobile={isMobile}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
        theme={theme}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SellerDashboard;
