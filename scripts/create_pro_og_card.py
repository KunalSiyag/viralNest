import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_pro_business_card_og():
    width, height = 1200, 630
    
    # 1. Canvas with rich gradient background (#0B0F19 to #161F33)
    canvas = Image.new('RGBA', (width, height), (11, 15, 25, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Add ambient background glow on top-right and bottom-left
    glow_top = Image.new('RGBA', (500, 500), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_top)
    glow_draw.ellipse((0, 0, 500, 500), fill=(225, 29, 72, 35))
    glow_top = glow_top.filter(ImageFilter.GaussianBlur(80))
    canvas.paste(glow_top, (700, -100), glow_top)

    # 2. Main Frosted Glass Business Card (Left Side, 540x480)
    bc_w, bc_h = 560, 480
    bc_x, bc_y = 60, 75

    # Card background (frosted glass dark slate)
    card = Image.new('RGBA', (bc_w, bc_h), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    
    # Draw dark translucent rounded rectangle
    card_draw.rounded_rectangle((0, 0, bc_w, bc_h), radius=28, fill=(19, 27, 44, 230))
    # Border
    card_draw.rounded_rectangle((0, 0, bc_w-1, bc_h-1), radius=28, outline=(255, 255, 255, 35), width=2)
    card_draw.rounded_rectangle((2, 2, bc_w-3, bc_h-3), radius=26, outline=(225, 29, 72, 40), width=1)

    # Embed exact public/images/logo.png inside the business card
    logo_path = 'public/images/logo.png'
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert('RGBA')
        aspect = logo.width / logo.height
        logo_h = 120
        logo_w = int(logo_h * aspect)
        logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        card.paste(logo_resized, (45, 45), logo_resized)
        title_x = 45 + logo_w + 25
    else:
        title_x = 45

    # Business Card Typography
    try:
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_tag = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
        font_desc = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except:
        font_brand = font_tag = font_desc = font_badge = ImageFont.load_default()

    # Brand Title & Subtitle inside card
    card_draw.text((title_x, 55), "PintDownload", fill=(255, 255, 255, 255), font=font_brand)
    card_draw.text((title_x, 125), "pintdownload.app", fill=(225, 29, 72, 255), font=font_tag)

    # Divider line inside business card
    card_draw.line((45, 195, bc_w - 45, 195), fill=(255, 255, 255, 30), width=1)

    # Description text
    card_draw.text((45, 220), "Free Pinterest Media Downloader", fill=(241, 245, 249, 255), font=font_tag)
    card_draw.text((45, 255), "Save HD MP4 Videos, Photos, GIFs,", fill=(148, 163, 184, 255), font=font_desc)
    card_draw.text((45, 285), "Carousels & Full Boards as ZIP.", fill=(148, 163, 184, 255), font=font_desc)

    # Feature Pill Badges inside card
    badges = ["1080p MP4", "Board ZIP", "No Login"]
    bx = 45
    by = 350
    for btext in badges:
        # Measure pill
        bw = int(len(btext) * 11) + 24
        bh = 36
        card_draw.rounded_rectangle((bx, by, bx + bw, by + bh), radius=18, fill=(225, 29, 72, 30), outline=(225, 29, 72, 100), width=1)
        card_draw.text((bx + 12, by + 8), btext, fill=(255, 255, 255, 255), font=font_badge)
        bx += bw + 14

    # Paste business card on canvas
    canvas.paste(card, (bc_x, bc_y), card)

    # 3. Right Side: Stacked Pinterest Carousel & Carousel Slides Deck
    # Create Pinterest Multi-Image Carousel Stack
    pin_files = ['side_pin_1.jpg', 'side_pin_2.jpg', 'side_pin_3.jpg', 'side_pin_4.jpg']
    
    # 2 Carousel Cards (Primary front card + Overlapping back card)
    # Front Carousel Card (Width 440, Height 290)
    cc_w, cc_h = 440, 280
    
    # Back Carousel Slide (slightly offset)
    if os.path.exists(os.path.join('public/images', pin_files[1])):
        back_img = Image.open(os.path.join('public/images', pin_files[1])).convert('RGBA')
        # Crop to 16:9
        bw, bh = back_img.size
        tr = cc_w / cc_h
        cw = bw
        ch = int(bw / tr)
        bcropped = back_img.crop((0, 0, cw, ch)).resize((cc_w, cc_h), Image.Resampling.LANCZOS)
        
        bmask = Image.new('L', (cc_w, cc_h), 0)
        ImageDraw.Draw(bmask).rounded_rectangle((0, 0, cc_w, cc_h), radius=22, fill=200)
        
        bcontainer = Image.new('RGBA', (cc_w, cc_h), (0, 0, 0, 0))
        bcontainer.paste(bcropped, (0, 0), bmask)
        ImageDraw.Draw(bcontainer).rounded_rectangle((0, 0, cc_w-1, cc_h-1), radius=22, outline=(255, 255, 255, 50), width=2)
        
        canvas.paste(bcontainer, (680, 80), bcontainer)

    # Front Carousel Slide
    if os.path.exists(os.path.join('public/images', pin_files[0])):
        front_img = Image.open(os.path.join('public/images', pin_files[0])).convert('RGBA')
        fw, fh = front_img.size
        tr = cc_w / cc_h
        cw = fw
        ch = int(fw / tr)
        top_y = (fh - ch) // 3
        fcropped = front_img.crop((0, top_y, fw, top_y + ch)).resize((cc_w, cc_h), Image.Resampling.LANCZOS)
        
        fmask = Image.new('L', (cc_w, cc_h), 0)
        ImageDraw.Draw(fmask).rounded_rectangle((0, 0, cc_w, cc_h), radius=22, fill=255)
        
        fcontainer = Image.new('RGBA', (cc_w, cc_h), (0, 0, 0, 0))
        fcontainer.paste(fcropped, (0, 0), fmask)
        
        # Draw Pinterest Carousel Indicator Badge on top-right of image (e.g. "1/4 ⚪⚪⚪")
        cdraw = ImageDraw.Draw(fcontainer)
        cdraw.rounded_rectangle((cc_w - 90, 16, cc_w - 16, 44), radius=14, fill=(0, 0, 0, 180))
        cdraw.text((cc_w - 78, 22), "1/4  •••", fill=(255, 255, 255, 255), font=font_badge)
        
        cdraw.rounded_rectangle((0, 0, cc_w-1, cc_h-1), radius=22, outline=(255, 255, 255, 80), width=2)
        
        canvas.paste(fcontainer, (650, 150), fcontainer)

    # Third Carousel Slide (Bottom right)
    if os.path.exists(os.path.join('public/images', pin_files[2])):
        bot_img = Image.open(os.path.join('public/images', pin_files[2])).convert('RGBA')
        bw, bh = bot_img.size
        tr = cc_w / cc_h
        cw = bw
        ch = int(bw / tr)
        bcropped = bot_img.crop((0, 0, cw, ch)).resize((cc_w, cc_h), Image.Resampling.LANCZOS)
        
        bmask = Image.new('L', (cc_w, cc_h), 0)
        ImageDraw.Draw(bmask).rounded_rectangle((0, 0, cc_w, cc_h), radius=22, fill=230)
        
        bcontainer = Image.new('RGBA', (cc_w, cc_h), (0, 0, 0, 0))
        bcontainer.paste(bcropped, (0, 0), bmask)
        ImageDraw.Draw(bcontainer).rounded_rectangle((0, 0, cc_w-1, cc_h-1), radius=22, outline=(255, 255, 255, 60), width=2)
        
        canvas.paste(bcontainer, (700, 310), bcontainer)

    # 4. Save Image
    final_rgb = canvas.convert('RGB')
    final_rgb.save('public/images/og-cover.png', 'PNG')
    final_rgb.save('public/images/og-card.png', 'PNG')
    print("Professional Business Card OG image generated with exact logo.png and Pinterest Carousel Deck!")

if __name__ == '__main__':
    create_pro_business_card_og()
