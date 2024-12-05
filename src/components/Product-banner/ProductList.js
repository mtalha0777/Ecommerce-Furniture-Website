import React from 'react';
import { Grid, Typography, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';

const ProductList = ({ products, handleCardClick }) => {
  return (
    <Grid container spacing={3}>
      {products.length === 0 ? (
        <Typography
          variant="body1"
          align="left"
          sx={{ 
            width: "100%", 
            color: "#2C3E50", 
            backgroundColor: "#F8F9FA", 
            padding: "16px",
            borderRadius: "8px"
          }}
        >
          No products found for this shop.
        </Typography>
      ) : (
        products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                },
              }}
              onClick={() => handleCardClick(product)}
            >
              <CardActionArea sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: 200,
                    borderRadius: "12px 12px 0 0",
                    objectFit: "cover",
                    width: "100%",
                  }}
                  image={`http://localhost:3001/uploads/${product.images[0]}`}
                  alt={product.productName}
                />
                <CardContent sx={{ flexGrow: 1, minHeight: 0, textAlign: 'left' }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ 
                      color: "#2C3E50", 
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {product.productName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: "#34495E", 
                      fontWeight: "500",
                      marginBottom: "4px"
                    }}
                  >
                    Price: ${product.price}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#34495E", 
                      fontWeight: "500"
                    }}
                  >
                    Category: {product.category}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default ProductList; 