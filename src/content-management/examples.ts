// Content Management JSON Examples
// These examples show different types of sections you can create

export const CONTENT_EXAMPLES = {
  
  // Hero Section Example
  heroSection: {
    sectionName: "hero-section",
    sectionContent: JSON.stringify({
      title: "Transform Your Career with Expert-Led Training",
      subtitle: "Join thousands of professionals who have advanced their careers",
      description: "Comprehensive courses designed by industry experts to help you master new skills and accelerate your professional growth.",
      ctaButton: {
        primary: {
          text: "Start Learning Today",
          link: "/courses",
          style: "bg-red-500 hover:bg-red-600"
        },
        secondary: {
          text: "Watch Demo",
          link: "/demo",
          style: "border border-red-500 text-red-500"
        }
      },
      backgroundImage: "/images/hero-background.jpg",
      features: [
        "Expert Instructors",
        "Industry-Relevant Content",
        "Flexible Learning Schedule",
        "Certificate of Completion"
      ],
      stats: {
        students: "10,000+",
        courses: "150+",
        instructors: "50+",
        rating: "4.9/5"
      }
    })
  },

  // About Us Section Example
  aboutSection: {
    sectionName: "about-us-section",
    sectionContent: JSON.stringify({
      title: "About Horumarka Dadka",
      subtitle: "Empowering Growth Through Education",
      description: "We are a leading training provider dedicated to uplifting individuals, businesses, and government institutions through comprehensive educational programs.",
      mission: "To provide world-class training that transforms lives and drives economic growth",
      vision: "To be the premier educational institution in the region",
      values: [
        {
          title: "Excellence",
          description: "We strive for the highest standards in everything we do",
          icon: "/icons/excellence.svg"
        },
        {
          title: "Innovation",
          description: "We embrace new technologies and teaching methods",
          icon: "/icons/innovation.svg"
        },
        {
          title: "Integrity",
          description: "We operate with honesty and transparency",
          icon: "/icons/integrity.svg"
        }
      ],
      team: {
        title: "Our Leadership Team",
        members: [
          {
            name: "John Doe",
            position: "CEO & Founder",
            image: "/team/john-doe.jpg",
            bio: "20+ years of experience in education and training"
          }
        ]
      }
    })
  },

  // Course Section Example
  courseSection: {
    sectionName: "featured-courses",
    sectionContent: JSON.stringify({
      title: "Featured Courses",
      subtitle: "Master In-Demand Skills",
      description: "Choose from our carefully curated selection of professional development courses",
      categories: [
        {
          id: "business",
          name: "Business Development",
          description: "Learn essential business skills",
          icon: "/icons/business.svg",
          courses: [
            {
              id: "bus-101",
              title: "Business Setup Fundamentals",
              description: "Complete guide to starting your business",
              duration: "6 weeks",
              level: "Beginner",
              price: "$299",
              rating: 4.8,
              students: 1250,
              instructor: "Jane Smith",
              thumbnail: "/courses/business-setup.jpg"
            }
          ]
        },
        {
          id: "digital-marketing",
          name: "Digital Marketing",
          description: "Master online marketing strategies",
          icon: "/icons/marketing.svg",
          courses: [
            {
              id: "dm-101",
              title: "Digital Marketing Mastery",
              description: "Complete digital marketing course",
              duration: "8 weeks",
              level: "Intermediate",
              price: "$399",
              rating: 4.9,
              students: 2100,
              instructor: "Mike Johnson",
              thumbnail: "/courses/digital-marketing.jpg"
            }
          ]
        }
      ]
    })
  },

  // Contact Section Example
  contactSection: {
    sectionName: "contact-section",
    sectionContent: JSON.stringify({
      title: "Get In Touch",
      subtitle: "We'd Love to Hear From You",
      description: "Have questions about our courses? Ready to start your learning journey? Contact us today!",
      contactInfo: {
        phone: {
          display: "+252 638972482",
          link: "tel:+252638972482"
        },
        email: {
          display: "info@horumarkadadka.com",
          link: "mailto:info@horumarkadadka.com"
        },
        address: {
          street: "123 Education Street",
          city: "Mogadishu",
          country: "Somalia",
          full: "123 Education Street, Mogadishu, Somalia"
        },
        socialMedia: [
          {
            platform: "Facebook",
            url: "https://facebook.com/horumarkadadka",
            icon: "/icons/facebook.svg"
          },
          {
            platform: "Twitter",
            url: "https://twitter.com/horumarkadadka",
            icon: "/icons/twitter.svg"
          },
          {
            platform: "LinkedIn",
            url: "https://linkedin.com/company/horumarkadadka",
            icon: "/icons/linkedin.svg"
          }
        ]
      },
      office: {
        hours: [
          { day: "Monday - Friday", time: "8:00 AM - 6:00 PM" },
          { day: "Saturday", time: "9:00 AM - 4:00 PM" },
          { day: "Sunday", time: "Closed" }
        ],
        mapUrl: "https://maps.google.com/embed?..."
      }
    })
  },

  // Footer Section Example
  footerSection: {
    sectionName: "footer-section",
    sectionContent: JSON.stringify({
      logo: {
        image: "/logos/footer-logo.svg",
        text: "DADKA"
      },
      description: "Horumarka Dadka is a leading training provider dedicated to uplifting individuals, businesses and government institutions.",
      links: {
        quickLinks: [
          { text: "About Us", url: "/about-us" },
          { text: "What We Do", url: "/what-we-do" },
          { text: "Courses", url: "/courses" },
          { text: "Join Us", url: "/careers/join-us" }
        ],
        legal: [
          { text: "Terms and Conditions", url: "/terms-conditions" },
          { text: "Privacy Policy", url: "/privacy-policy" },
          { text: "Contact Us", url: "/contact-us" }
        ]
      },
      contact: {
        phone: "+252 638972482",
        email: "info@horumarkadadka.com"
      },
      socialMedia: [
        { platform: "TikTok", icon: "/socials/tiktok.svg", url: "#" },
        { platform: "Facebook", icon: "/socials/facebook.svg", url: "#" },
        { platform: "Instagram", icon: "/socials/instagram.svg", url: "#" },
        { platform: "YouTube", icon: "/socials/youtube.svg", url: "#" },
        { platform: "Twitter", icon: "/socials/twitter.svg", url: "#" }
      ],
      newsletter: {
        title: "Stay Updated",
        placeholder: "Enter your email",
        buttonText: "Subscribe Now"
      },
      copyright: {
        year: 2026,
        text: "Horumarka Dadka. All rights reserved. Empowering individuals, businesses, and institutions."
      }
    })
  }
};
