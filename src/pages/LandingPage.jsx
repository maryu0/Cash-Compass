import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Chatbot from "../components/Chatbot";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

function LandingPage() {
  useEffect(() => {
    // Section transition animations on scroll
    const sections = document.querySelectorAll("section");

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "0";
            entry.target.style.transform = "translateY(80px)";
            entry.target.style.transition =
              "opacity 1.5s ease-out, transform 1.5s ease-out";

            // Trigger animation
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }, 50);

            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -100px 0px" }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    // Fade-in animations on scroll
    const fadeElements = document.querySelectorAll(".fade-in");

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("appear");
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeElements.forEach((element) => {
      fadeObserver.observe(element);
    });

    // Enhanced smooth scrolling with offset
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href !== "#" && href !== "#chat") {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });

    // Parallax effect for hero background
    const handleScroll = () => {
      const parallax = document.querySelector(".hero::before");
      if (parallax) {
        const speed = window.scrollY * 0.5;
        parallax.style.backgroundPositionY = -speed + "px";
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sectionObserver.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <Chatbot />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default LandingPage;
