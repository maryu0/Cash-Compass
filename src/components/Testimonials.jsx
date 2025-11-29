import React from "react";
import "./Testimonials.css";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Pratim Prakash",
      role: "Gig Worker & Tutor",
      content:
        "CashCompass helped me manage my unpredictable income. The alerts warn me before money gets tight, and the AI coach gives advice I actually understand. Total game changer!",
      rating: 5,
    },
    {
      id: 2,
      name: "Ayush Gupta",
      role: "Freelance Designer",
      content:
        "Finally found something designed for people like me. The app understands my fluctuating income and helps me save smartly. In Spanish too—that means everything.",
      rating: 5,
    },
    {
      id: 3,
      name: "Aditya Pramanik",
      role: "Street Vendor & Small Business Owner",
      content:
        "The simple language and lack of jargon is perfect. I now have an emergency fund and actually understand my spending. CashCompass gave me confidence with my money.",
      rating: 5,
    },
  ];

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>Trusted by People Like You</h2>
          <p>
            Gig workers, informal economy participants, and everyday people
            building financial security with CashCompass
          </p>
        </div>
        <div className="testimonials">
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <p className="testimonial-text">{testimonial.content}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
