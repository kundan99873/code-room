import { useEffect, useState } from "react";
import { useTheme } from "@/context/themeContext";

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = "h-full w-full object-contain" }: BrandLogoProps) {
  const { resolved } = useTheme();
  const [logoUrl, setLogoUrl] = useState("/logo.png");

  useEffect(() => {
    if (resolved === "dark") {
      setLogoUrl("/logo.png");
      return;
    }

    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Scan and convert white/light pixels to dark pixels for light mode
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // 1. Identify white/near-white pixels (the word "CODES" in the logo)
        if (a > 0 && r > 210 && g > 210 && b > 210) {
          // Convert to black/dark charcoal
          data[i] = 18;      // Red
          data[i + 1] = 18;  // Green
          data[i + 2] = 23;  // Blue
        }
        // 2. Identify light-grey pixels (the tagline "CODE. COLLABORATE. CREATE." in the logo)
        else if (a > 0 && r > 100 && r < 200 && g > 100 && g < 200 && b > 100 && b < 200) {
          // Convert to a darker grey that is readable on light backgrounds
          data[i] = 80;      // Red
          data[i + 1] = 80;  // Green
          data[i + 2] = 85;  // Blue
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setLogoUrl(canvas.toDataURL());
    };
    img.onerror = () => {
      setLogoUrl("/logo.png");
    };
  }, [resolved]);

  return <img src={logoUrl} className={className} alt="CodesRoom Logo" />;
}
