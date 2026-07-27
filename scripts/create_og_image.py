import os
from PIL import Image, ImageDraw, ImageFont

def create_og_banner():
    # 1. Canvas 1200x630
    width, height = 1200, 630
    banner = Image.new('RGBA', (width, height), (15, 23, 42, 255)) # Slate dark #0F172A

    draw = ImageDraw.Draw(banner)
    
    # 2. Load exact public/images/logo.png
    logo_path = 'public/images/logo.png'
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert('RGBA')
        aspect = logo.width / logo.height
        new_h = 140
        new_w = int(new_h * aspect)
        logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Paste logo on the left at (80, 200)
        banner.paste(logo_resized, (80, 200), logo_resized)
        text_x = 80 + new_w + 35
    else:
        text_x = 80

    # 3. Add Typography
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_sub1 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
        font_sub2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        font_title = font_sub1 = font_sub2 = ImageFont.load_default()

    # Draw Brand Title "PintDownload"
    draw.text((text_x, 210), "PintDownload", fill=(255, 255, 255, 255), font=font_title)
    
    # Taglines
    draw.text((text_x, 285), "Free Pinterest Downloader", fill=(225, 29, 72, 255), font=font_sub1)
    draw.text((text_x, 325), "Video (MP4) • Photo • GIF • Board ZIP", fill=(148, 163, 184, 255), font=font_sub2)

    # 4. Right side: LANDSCAPE Pinterest Cards (Horizontal 16:9 ratio)
    pin_files = ['side_pin_1.jpg', 'side_pin_2.jpg', 'side_pin_3.jpg', 'side_pin_4.jpg']
    
    card_w = 430
    card_h = 230
    card_positions = [
        (690, 75),
        (720, 325),
    ]

    for i, pfile in enumerate(pin_files[:2]):
        ppath = os.path.join('public/images', pfile)
        if os.path.exists(ppath):
            pin_img = Image.open(ppath).convert('RGBA')
            
            # Crop to horizontal landscape ratio (card_w x card_h)
            pw, ph = pin_img.size
            target_ratio = card_w / card_h
            current_ratio = pw / ph

            if current_ratio > target_ratio:
                crop_w = int(ph * target_ratio)
                crop_h = ph
                left = (pw - crop_w) // 2
                top = 0
            else:
                crop_w = pw
                crop_h = int(pw / target_ratio)
                left = 0
                top = (ph - crop_h) // 3

            cropped = pin_img.crop((left, top, left + crop_w, top + crop_h))
            resized = cropped.resize((card_w, card_h), Image.Resampling.LANCZOS)

            # Round corners
            mask = Image.new('L', (card_w, card_h), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.rounded_rectangle((0, 0, card_w, card_h), radius=24, fill=255)

            # Create container card with subtle border
            card_container = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
            card_container.paste(resized, (0, 0), mask)
            
            border_draw = ImageDraw.Draw(card_container)
            border_draw.rounded_rectangle((0, 0, card_w-1, card_h-1), radius=24, outline=(255, 255, 255, 60), width=2)

            pos = card_positions[i]
            banner.paste(card_container, pos, card_container)

    # Save outputs to public/images/og-cover.png and og-card.png
    banner_rgb = banner.convert('RGB')
    banner_rgb.save('public/images/og-cover.png', 'PNG')
    banner_rgb.save('public/images/og-card.png', 'PNG')
    print("OG Social preview image successfully generated using logo.png and landscape cards!")

if __name__ == '__main__':
    create_og_banner()
