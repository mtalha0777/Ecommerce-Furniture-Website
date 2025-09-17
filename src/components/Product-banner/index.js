import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Banner = ({ title, images, category }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Slider settings
    const sliderSettings = {
        dots: true,       
        infinite: true,  
        speed: 500,       
        slidesToShow: 1,  
        slidesToScroll: 1,
        autoplay: true,   
        autoplaySpeed: 3000, 
        arrows: false,    
    };

    const handleNavigate = () => {
        navigate('/productList', { state: { category } });
    };

    const styles = {
        card: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
            padding: '20px',
            textAlign: 'center',
            width: '350px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #EFEBE9'
        },
        cardTitle: {
            fontFamily: "'Playfair Display', serif",
            color: '#5D4037',
            fontSize: '2rem',
            marginBottom: '15px',
        },
        // --- Slider ke image ka style ---
        image: {
            width: '100%',
            height: '250px',
            objectFit: 'cover',
            borderRadius: '10px',
        },
        button: {
            backgroundColor: '#8D6E63',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 30px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            marginTop: '20px' 
        }
    };

    const cardStyle = isHovered ? { ...styles.card, transform: 'translateY(-10px)', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)' } : styles.card;
    const buttonStyle = isHovered ? { ...styles.button, backgroundColor: '#5D4037' } : styles.button;

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
        >
            <h3 style={styles.cardTitle}>{title}</h3>
            
        
            {images && images.length > 0 ? (
                <Slider {...sliderSettings}>
                    {images.map((imgUrl, index) => (
                        <div key={index}>
                            <img src={imgUrl} alt={`${title} ${index + 1}`} style={styles.image} />
                        </div>
                    ))}
                </Slider>
            ) : (
               <img src='https://placehold.co/350x250/F5EFE6/5D4037?text=No+Image' alt={title} style={styles.image} />
            )}

            <button style={buttonStyle}>Explore Collection</button>
        </div>
    );
};
const HomePage = () => {
    const [categoriesData, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true); 
    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            setLoading(true); 
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    name,
                    category_slug,
                    products (
                        image_urls
                    )
                `)
                .limit(3, { foreignTable: 'products' }); 

            if (error) {
                console.error("Error fetching data:", error);
            } else {
                setCategoriesData(data);
            }
            setLoading(false); 
        };

        fetchCategoriesAndProducts();
    }, []);

    if (loading) {
        return (
            <div style={styles.page}>
                <h1 style={styles.mainTitle}>Discover Your Style</h1>
                <p style={styles.loadingText}>Loading Categories...</p>
            </div>
        );
    }



 return (
        <div style={styles.page}>
            <h1 style={styles.mainTitle}>Discover Your Style</h1>
            <div style={styles.bannersContainer}>
                {categoriesData.map((cat) => {
                    const productImages = cat.products
                        ? cat.products.flatMap(product => product.image_urls || [])
                        : [];

                    return (
                        <Banner
                            key={cat.name}
                            title={cat.name}
                            images={productImages} 
                            category={cat.category_slug}
                        />
                    );
                })}
            </div>
        </div>
    );
};

    const styles = {
        page: {
            backgroundColor: '#FFF8E1',
            padding: '60px 20px',
            minHeight: '80vh'
        },
        mainTitle: {
            textAlign: 'center',
            marginBottom: '50px',
            color: '#5D4037',
            fontFamily: "'Playfair Display', serif",
            fontSize: '3rem',
        },
        bannersContainer: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '40px'
        },
        loadingText: {
            textAlign: 'center',
            fontSize: '1.5rem',
            color: '#8D6E63'
        }
    };
export default HomePage;