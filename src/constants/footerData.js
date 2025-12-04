// footerData.js
import {
  Mail, Phone, MapPin, Clock, Crown, Star, Sparkles,
  Home, User, ShoppingBag, Heart, Shield, Diamond,
  Instagram, Facebook, Truck, RefreshCw, Package
} from "lucide-react";

export const CONTACT_DATA = [
  { id: 1, icon: Mail, title: "Email", content: "contact@zohra.com", animation: "pulse" },
  { id: 2, icon: Phone, title: "Customer Care", content: "+91 88833 85888", animation: "heartbeat" },
  { id: 3, icon: MapPin, title: "Location", content: "8/2514 Thiyagi Kumaran St, Pandian Nagar, Tiruppur, Tamilnadu - 641602", animation: "shimmer" },
  { id: 4, icon: Clock, title: "Business Hours", content: "Mon–Sun: 9AM – 8PM", animation: "rotateSlow" }
];

export const SOCIAL_MEDIA = [
  {
    id: 1,
    icon: Instagram,
    name: "Instagram",
    url: "https://www.instagram.com/zohra/",
    color: "instagram",
    animation: "glow"
  },
  {
    id: 2,
    icon: Facebook,
    name: "Facebook",
    url: "https://www.facebook.com/share/19yyr4QjpU/?mibextid=wwXIfr",
    color: "facebook",
    animation: "float"
  },
];

export const CATEGORIES = [
  "New Arrivals",
  "Premium Collections",
  "Evening Wear",
  "Casual Wear",
  "Traditional Wear",
  "Accessories",
  "Luxury Fabrics",
  "Limited Editions"
];

export const TRUST_BADGES = [
  { icon: Diamond, text: "Premium Quality", animation: "glow" },
  { icon: Shield, text: "Secure Payment", animation: "pulse" },
  { icon: Truck, text: "Free Shipping", animation: "shimmer" },
  { icon: RefreshCw, text: "Easy Returns", animation: "rotateSlow" },
  { icon: Package, text: "Gift Packaging", animation: "float" }
];

export const QUICK_LINKS = [
  { label: "Home", path: "/", icon: Home },
  { label: "New Arrivals", path: "/new-arrivals", icon: Sparkles },
  { label: "Best Sellers", path: "/best-sellers", icon: Star },
  { label: "About Us", path: "/about-us", icon: User }
];

export const POLICY_LINKS = [
  { label: "Privacy Policy", path: "/privacy-policy", icon: Shield },
  { label: "Terms of Service", path: "/terms" },
  { label: "Shipping Policy", path: "/shipping" },
  { label: "Returns & Refunds", path: "/cancellation" }
];