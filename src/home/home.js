import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";

import ProductsPage from "../components/product/products";
import Footer from "../components/footer/footer";
import CreateProduct from "../components/product/createProduct";

function Home() {
  const [roleID, setRoleID] = React.useState(localStorage.getItem("userRole"));

  return (
    <div>
      <div className="d-flex justify-content-center my-4">
        {roleID == 2 && <CreateProduct />}
      </div>

      <ProductsPage />

      <Footer />
    </div>
  );
}

export default Home;
