# **Beauty Mirror Quiz Brand Guidelines**

This document outlines the visual design system for the Beauty Mirror Quiz application. It includes specifications for both **Light and Dark themes**, covering typography, color palettes, components, and spacing to serve as a single source of truth for designers and developers.

## **Typography**

The typography system is consistent across both light and dark themes.

**Primary Font:** Inter (from Google Fonts)

* **H1:** text-2xl font-bold (24px, 700 weight)  
* **H2:** text-xl font-bold (20px, 700 weight)  
* **H3:** text-lg font-semibold (18px, 600 weight)  
* **Body:** text-base font-medium (16px, 500 weight)  
* **Secondary Text:** text-sm font-medium (14px, 500 weight)  
* **Small Text:** text-xs font-medium (12px, 500 weight)

**Line Height:**

* leading-tight for headings  
* leading-relaxed for body text

## **Color Palette**

### **Light Mode Palette**

**Core Colors:**

* **Primary:** \#8A60FF (Purple)  
* **Text Primary:** \#4B3963 (Dark Purple)  
* **Text Secondary:** \#6c757d (Gray)  
* **Light Container / Background:** \#F0F4FF (Light Blue)  
* **Surface:** \#FFFFFF (White, for cards)

**Accent Colors (Shared):**

* **Blue:** \#53E5FF  
* **Pink:** \#FF99CC  
* **Success:** \#33C75A  
* **Warning:** \#FFB800  
* **Error:** \#FF6B6B

### **Dark Mode Palette**

**Core Colors:**

* **Primary:** \#A385E9 (Brighter Purple for better contrast)  
* **Text Primary:** \#F5F5F5 (Off-white)  
* **Text Secondary:** \#969AB7 (Light Gray-Blue)  
* **Background:** \#181A20 (Near Black)  
* **Surface:** \#35383F (Dark Gray, for cards)  
* **Border / Divider:** \#4A4E5A (Subtle border color)

---

## **Buttons**

### **Light Mode Buttons**

**Primary Button:**

CSS

bg-primary text-white font-semibold py-4 px-6 rounded-xl   
shadow-lg hover:shadow-xl transition-all duration-200

**Secondary Button:**

CSS

bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg   
hover:bg-gray-300 transition-colors duration-200

**Back Button (Glassmorphism):**

CSS

bg-white/80 backdrop-blur-sm rounded-full w-10 h-10  
flex items-center justify-center shadow-lg

### **Dark Mode Buttons**

**Primary Button:**

CSS

bg-primary text-white font-semibold py-4 px-6 rounded-xl   
hover:brightness-110 transition-transform duration-200

**Secondary Button:**

CSS

bg-surface text-text-primary font-medium py-3 px-6 rounded-lg   
hover:bg-border transition-colors duration-200

**Back Button (Glassmorphism):**

CSS

bg-surface/80 backdrop-blur-sm rounded-full w-10 h-10  
flex items-center justify-center border border-white/10

## **Border Radius**

The border radius system is consistent across both light and dark themes.

* **Buttons:** rounded-xl (12px)  
* **Cards:** rounded-2xl (16px) / rounded-3xl (24px)  
* **Back Buttons:** rounded-full (50%)  
* **Input Fields:** rounded-lg (8px)  
* **Small Elements:** rounded-md (6px)

## **Cards & Containers**

### **Light Mode Cards**

**Primary Card:**

CSS

bg-white rounded-2xl shadow-xl p\-8

**Modals:**

CSS

bg-white rounded-3xl shadow-2xl p\-6

### **Dark Mode Cards**

**Primary Card:**

CSS

bg-surface rounded-2xl p\-8 border border-white/10

**Modals:**

CSS

bg-surface rounded-3xl p\-6 border border-white/10

## **Shadows (Box Shadow)**

* **Light Mode:** Shadows are used to create depth and elevation.  
  * **Subtle:** shadow-lg  
  * **Medium:** shadow-xl  
  * **Strong:** shadow-2xl  
* **Dark Mode:** Shadows are less effective. Depth is created using borders and variations in surface brightness. When used, shadows should be very subtle (e.g., shadow-md shadow-black/20).

## **Animations & Transitions**

The animation and transition system is consistent across both themes.

* transition-all duration-200  
* transition-colors duration-200  
* transition-transform duration-300  
* hover:shadow-xl (primarily for light mode)  
* hover:scale-105  
* hover:brightness-110 (effective for dark mode)

---

## **Background & Decorative Elements**

The animated "Aurora" background is a key visual feature for both themes. The core colors (Blue: \#53E5FF, Pink: \#FF99CC) are vibrant enough to work well against both light and dark backgrounds.

* **Animated Background:** Two ellipses with blur(120px).  
* **Colors:** \#53E5FF and \#FF99CC.

## **Spacing & Sizing**

The spacing and sizing system is consistent across both themes.

* **Container Padding:** p-6 (24px)  
* **Button Padding:** py-4 px-6  
* **Input Padding:** py-3 px-4  
* **Max Width (Mobile Cards):** max-w-md (448px)  
* **Max Width (Content):** max-w-lg (512px)

## **Interaction States**

Interaction states adapt colors based on the active theme.

* **Active State:** transform scale-105  
* **Disabled State:** opacity-50 cursor-not-allowed  
* **Hover State:** hover:scale-102, hover:brightness-110 (Dark), hover:shadow-xl (Light)