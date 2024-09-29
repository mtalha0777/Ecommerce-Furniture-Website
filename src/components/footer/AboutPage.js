import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AboutPage.css'; // Add your custom CSS for styling

const AboutPage = () => {
    const companyInfoRef = useRef(null);
    const deliveryInfoRef = useRef(null);
    const privacyPolicyRef = useRef(null);
    const termsConditionsRef = useRef(null);
    const contactRef = useRef(null);
    const shippingInfoRef = useRef(null);
    const returnPolicyRef = useRef(null);
    const supportCenterRef = useRef(null);

    const { hash } = useLocation();

    useEffect(() => {
        switch (hash) {
            case '#company-info':
                companyInfoRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#delivery-info':
                deliveryInfoRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#privacy-policy':
                privacyPolicyRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#terms-conditions':
                termsConditionsRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#contact-us':
                contactRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#shipping-info':
                shippingInfoRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#return-policy':
                returnPolicyRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            case '#support-center':
                supportCenterRef.current.scrollIntoView({ behavior: 'smooth' });
                break;
            default:
                break;
        }
    }, [hash]);

    return (
        <div className="about-page">
            <header>
                <h1>About Us & Information Area</h1>
            </header>

            <section className="company-section" ref={companyInfoRef} id="company-info">
                <h3>Company Information</h3>
                <p>Learn more about our company's history, values, and mission.</p>
            </section>

            <section className="information-section" ref={deliveryInfoRef} id="delivery-info">
                <h3>Delivery Information</h3>
                <p>Find out about our shipping policies, times, and more.</p>
            </section>

            <section className="information-section" ref={privacyPolicyRef} id="privacy-policy">
                <h3>Privacy Policy</h3>
                <p>Your privacy is important to us. Learn about how we handle your data.</p>
            </section>

            <section className="information-section" ref={termsConditionsRef} id="terms-conditions">
                <h3>Terms & Conditions</h3>
                <p>Understand the terms and conditions that govern your use of our services.</p>
            </section>

            <section className="company-section" ref={contactRef} id="contact-us">
                <h3>Contact Us</h3>
                <p>Get in touch with us for any queries or support.</p>
            </section>

            <section className="information-section" ref={shippingInfoRef} id="shipping-info">
                <h3>Shipping Policy</h3>
                <p>Review our shipping policies, costs, and delivery times.</p>
            </section>

            <section className="information-section" ref={returnPolicyRef} id="return-policy">
                <h3>Return Policy</h3>
                <p>Learn about our return and refund policies.</p>
            </section>

            <section className="information-section" ref={supportCenterRef} id="support-center">
                <h3>Support Center</h3>
                <p>Visit our support center for assistance with any of our services or products.</p>
            </section>
        </div>
    );
}

export default AboutPage;
