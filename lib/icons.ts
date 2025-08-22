import {
  Home,
  User,
  Mail,
  Github,
  Twitter,
  Instagram,
  Globe,
  Youtube,
  Linkedin,
  Facebook,
  Twitch,
  Music,
  ShoppingBag,
  Link,
  BookOpen,
  Camera,
} from "lucide-react";

export const availableIcons = {
  Home,
  User,
  Mail,
  Globe,
  Link,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Twitch,
  Music,       // Spotify, Apple Music
  ShoppingBag, // e-commerce links
  BookOpen,    // blog, medium
  Camera,      // photography, Instagram alt
};

export type IconName = keyof typeof availableIcons;

export const iconOptions = Object.keys(availableIcons).map((key) => ({
  name: key,
  value: key as IconName,
}));
