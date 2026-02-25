import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-[#D7E7E5] bg-[#F4F8F8]">
      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid md:grid-cols-2 gap-12">
        {/* LEFT */}
        <div>
          <img
            src="/image/logo.png"
            alt="Graphura Logo"
            className="w-36 mb-4"
          />

          <p className="text-[15.5px] text-[#4F6F73] leading-relaxed max-w-md">
            Graphura enables teams to plan, track, and execute work through
            structured workflows designed for clarity, accountability, and
            scale.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-3 mt-6">
            <Social link="https://www.facebook.com/Graphura.in?rdid=WaFFaguN1kjctVYD">
              <FaFacebookF />
            </Social>

            <Social link="https://x.com/Graphura">
              <FaTwitter />
            </Social>

            <Social link="https://www.linkedin.com/company/graphura-india-private-limited/">
              <FaLinkedinIn />
            </Social>

            <Social link="https://www.instagram.com/graphura.in">
              <FaInstagram />
            </Social>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:ml-auto max-w-sm">
          <h3 className="text-xl font-semibold text-[#0F2F2C] mb-6">Contact</h3>

          <ContactItem
            icon={<FaMapMarkerAlt />}
            text="Graphura India Private Limited, near RSF, Pataudi, Gurgaon, Haryana 122503"
          />
          <ContactItem icon={<FaPhoneAlt />} text="+91 7378021327" />
          <ContactItem icon={<FaEnvelope />} text="support@graphura.in" />

          {/* CTA */}
          <div className="flex gap-3 mt-8">
            <Link
              to="/signup"
              className="text-[15px] font-semibold text-[#235857] hover:underline"
            >
              Create workspace
            </Link>

            <span className="text-gray-300">|</span>

            <Link
              to="/login"
              className="text-[15px] font-semibold text-[#235857] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-[#D7E7E5] py-4 text-center text-[#6B7C79] text-[14.5px]">
        © 2026 Graphura India Private Limited. All rights reserved.
      </div>
    </footer>
  );
};

/* CONTACT ITEM */

const ContactItem = ({ icon, text }) => (
  <div className="flex gap-3 mb-4 text-[#4F6F73]">
    <span className="text-[#235857] mt-1">{icon}</span>
    <p className="text-[15.5px] leading-relaxed">{text}</p>
  </div>
);

/* SOCIAL */

const Social = ({ children, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="
      h-9 w-9
      flex items-center justify-center
      rounded-lg
      border border-[#D7E7E5]
      text-[#4F6F73]
      transition-all duration-300
      hover:border-[#235857]
      hover:text-[#235857]
      hover:-translate-y-[2px]
      hover:bg-white
    "
  >
    {children}
  </a>
);

export default Footer;
