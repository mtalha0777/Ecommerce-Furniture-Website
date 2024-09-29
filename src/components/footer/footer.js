import React from 'react';
import './footer.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link'; // Import HashLink
import Icon1 from '../../assets/images/icon-1.svg';
import Icon2 from '../../assets/images/icon-2.svg';
import Icon3 from '../../assets/images/icon-3.svg';
import Icon5 from '../../assets/images/icon-5.svg';
import logo from '../../assets/images/logo.png';
import bed from '../../assets/images/bed.webp';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import paymentImage from '../../assets/images/payment-method.png';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { EmailTwoTone } from '@mui/icons-material';

const Footer = () => {
    return (
        <>
            <section className='newsLetterSection'>
                <div className='container-fluid'>
                    <div className='box d-flex align-items-center'>
                        <div className='info'>
                            <h2>Stay home & get your<br /> daily needs from our shop</h2>
                            <p>Start Your Daily Shopping with AR Furniture</p>
                        </div>
                        <div className='img'>
                            <img src={bed} alt='bed' className='w-100' />
                        </div>
                    </div>
                </div>
            </section>

            <div className='footerWrapper'>
                <div className='footerBoxes'>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col'>
                                <div className='box d-flex align-items-center w-100'>
                                    <span><img src={Icon1} alt="Best Price & Offers" /></span>
                                    <div className='info'>
                                        <h4>Best Offers</h4>
                                        <p>Orders Rs:50k or more</p>
                                    </div>
                                </div>
                            </div>

                            <div className='col'>
                                <div className='box d-flex align-items-center w-100'>
                                    <span><img src={Icon2} alt="Fast Delivery" /></span>
                                    <div className='info'>
                                        <h4>Fast Delivery</h4>
                                        <p>Orders Rs:50k or more</p>
                                    </div>
                                </div>
                            </div>

                            <div className='col'>
                                <div className='box d-flex align-items-center w-100'>
                                    <span><img src={Icon3} alt="Great Daily Deal" /></span>
                                    <div className='info'>
                                        <h4>Great Daily Deals</h4>
                                        <p>Orders Rs:50k or more</p>
                                    </div>
                                </div>
                            </div>

                            <div className='col'>
                                <div className='box d-flex align-items-center w-100'>
                                    <span><img src={Icon5} alt="Easy Returns" /></span>
                                    <div className='info'>
                                        <h4>Easy Returns</h4>
                                        <p>Orders Rs:50k or more</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-md-3 part1'>
                                <Link to='/'><img src={logo} alt="AR Furniture Logo" /></Link>
                                <br /><br />
                                <p><LocationOnOutlinedIcon /> <strong>Address</strong>: Chiniot, Pakistan</p>
                                <p><HeadphonesOutlinedIcon /> <strong>Call Us:</strong> (+92) -3221796734</p>
                                <p><EmailOutlinedIcon /> <strong>Email:</strong> anasjavaid102@gmail.com</p>
                                <p><WatchLaterOutlinedIcon /> <strong>Hours:</strong> 10:00 - 18:00, Mon - Sat</p>
                            </div>

                            <div className='col-md-6 part2'>
                                <div className='row'>
                                    <div className='col'>
                                        <h3>Company</h3>
                                        <ul className="footer-list">
                                            <li><HashLink smooth to="/AboutPage#company-info">About Us</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#delivery-info">Delivery Information</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#privacy-policy">Privacy Policy</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#terms-conditions">Terms & Conditions</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#contact-us">Contact Us</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#support-center">Support Center</HashLink></li>
                                        </ul>
                                    </div>

                                    <div className='col'>
                                        <h3>Information Area</h3>
                                        <ul className="footer-list">
                                            <li><HashLink smooth to="/AboutPage#shipping-info">Shipping Policy</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#privacy-policy">Privacy Policy</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#return-policy">Return Policy</HashLink></li>
                                            <li><HashLink smooth to="/AboutPage#terms-conditions">Terms & Conditions</HashLink></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className='col-md-3 part3'>
                                <h3>Payment Method</h3>
                                <br />
                                <p>Secured Payment Gateways</p>
                                <img src={paymentImage} alt="Payment Methods" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <hr />

                        <div className='row lastStrip'>
                            <div className='col-md-3 part_1'>
                                <p><strong>© 2024, AR Furniture</strong></p>
                            </div>

                            <div className='col-md-6 d-flex part_2'>
                                <div className='m-auto d-flex align-items-center phWrap'>
                                    <div className='phNo d-flex align-items-center mx-5'>
                                        <span><EmailTwoTone /></span>
                                        <div className='info ml-3'>
                                            <h3 className='text-g mb-0'>arfurniture@Support.com</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='col-md-3 part3 part_3'>
                                <div className='d-flex align-items-center'>
                                    <h5>Follow Us</h5>
                                    <ul className='list list-inline d-flex'>
                                        <li className='list-inline-item mr-3'>
                                            <Link to='https://www.facebook.com/'><FacebookOutlinedIcon /></Link>
                                        </li>
                                        <li className='list-inline-item mr-3'>
                                            <Link to='https://www.twitter.com/'><TwitterIcon /></Link>
                                        </li>
                                        <li className='list-inline-item mr-3'>
                                            <Link to='https://www.instagram.com/' style={{ color: 'red' }}><InstagramIcon /></Link>
                                        </li>
                                        <li className='list-inline-item'>
                                            <Link to='https://www.youtube.com/' style={{ color: 'red' }}><YouTubeIcon /></Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Footer;
