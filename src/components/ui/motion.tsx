import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import * as React from "react";

// Reusable animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Hover animations for cards - subtle lift with shadow shift
export const cardHover: Variants = {
  rest: {
    y: 0,
    x: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  hover: {
    y: -4,
    x: -4,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Button press animation - moves with the shadow
export const buttonPress: Variants = {
  rest: {
    x: 0,
    y: 0,
    transition: { duration: 0.1 },
  },
  hover: {
    x: -2,
    y: -2,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  },
  tap: {
    x: 4,
    y: 4,
    transition: { duration: 0.1 },
  },
};

// Animated card component with hover lift effect
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, hoverEffect = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("border bg-card text-card-foreground", className)}
        initial="rest"
        whileHover={hoverEffect ? "hover" : undefined}
        variants={cardHover}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// Animated button wrapper
interface MotionButtonWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const MotionButtonWrapper = React.forwardRef<HTMLDivElement, MotionButtonWrapperProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("inline-block", className)}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={buttonPress}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionButtonWrapper.displayName = "MotionButtonWrapper";

// Fade in on scroll component
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, className, delay = 0, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 30, x: 0 },
      down: { y: -30, x: 0 },
      left: { y: 0, x: 30 },
      right: { y: 0, x: -30 },
      none: { y: 0, x: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{
          opacity: 0,
          ...directionOffset[direction],
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          x: 0,
        }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// Stagger container for lists
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className, staggerDelay = 0.1, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1,
            },
          },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = "StaggerContainer";

// Stagger item for use inside StaggerContainer
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={fadeInUp}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// Hover scale effect
interface HoverScaleProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export const HoverScale = React.forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, className, scale = 1.02, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        whileHover={{ scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverScale.displayName = "HoverScale";

// Export motion for direct use
export { motion };
