import os
import re

head_template = """<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;800;900&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "surface": "#f9f9ff",
                "on-surface": "#191c22",
                "primary": "#0052ac",
                "primary-container": "#196ad4",
                "on-primary-container": "#ecf0ff",
                "background": "#f9f9ff",
                "on-background": "#191c22",
                "surface-container": "#ecedf7",
            },
            "borderRadius": {
                "DEFAULT": "0px",
                "lg": "0px",
                "xl": "0px",
                "full": "0px"
            },
            "spacing": {
                "xl": "64px",
                "base": "8px",
                "md": "24px",
                "gutter": "24px",
                "lg": "48px",
                "margin": "32px",
                "sm": "12px",
                "xs": "4px"
            },
            "fontFamily": {
                "label-sm": ["Work Sans", "sans-serif"],
                "body-md": ["Work Sans", "sans-serif"],
                "body-lg": ["Work Sans", "sans-serif"],
                "headline-md": ["Epilogue", "sans-serif"],
                "headline-lg": ["Epilogue", "sans-serif"],
                "headline-xl": ["Epilogue", "sans-serif"],
                "label-bold": ["Work Sans", "sans-serif"]
            },
            "fontSize": {
                "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "600"}],
                "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "500"}],
                "headline-md": ["24px", {"lineHeight": "1.2", "fontWeight": "800"}],
                "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                "headline-xl": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "900"}],
                "label-bold": ["14px", {"lineHeight": "1.2", "fontWeight": "700"}]
            }
        }
    }
}
</script>
<style>
    body { font-family: 'Work Sans', sans-serif; background-color: #f9f9ff; color: #191c22; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Epilogue', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .neobrutalist-card {
        border: 3px solid black;
        box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
        transition: all 0.1s ease;
        background-color: white;
        border-radius: 0px;
    }
    .neobrutalist-card:active {
        box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);
        transform: translate(8px, 8px);
    }
    .neobrutalist-btn {
        border: 4px solid black;
        box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
        transition: all 0.1s ease;
        background-color: #196ad4;
        color: white;
        font-family: 'Epilogue', sans-serif;
        font-weight: 900;
        text-transform: uppercase;
        cursor: pointer;
        border-radius: 0px;
    }
    .neobrutalist-btn:active {
        box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);
        transform: translate(4px, 4px);
    }
    .sketch-border {
        border: 3px solid black;
        position: relative;
    }
    .sketch-border::after {
        content: '';
        position: absolute;
        top: -2px; left: -2px; right: -2px; bottom: -2px;
        border: 1px solid black;
        pointer-events: none;
        opacity: 0.2;
    }
    .floating-voice {
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 100;
    }
    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1000;
        display: none; justify-content: center; align-items: center;
    }
    .modal-content {
        border: 4px solid black;
        box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
        background: white;
        border-radius: 0;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        position: relative;
    }
    .modal-close {
        position: absolute; right: 1rem; top: 1rem; font-size: 1.5rem; cursor: pointer;
    }
</style>
<title>Moore Money</title>
</head>"""

header_template = """<header class="bg-stone-50 border-b-4 border-black w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center px-6 py-4 sticky top-0 z-50">
<div class="text-2xl font-black text-black italic font-['Epilogue'] tracking-tighter uppercase">MOORE MONEY</div>
<nav class="hidden md:flex gap-8">
<a class="font-['Epilogue'] font-black uppercase tracking-tighter text-black hover:bg-[#196ad4] hover:text-white transition-all duration-75 active:translate-x-1 active:translate-y-1" href="/dashboard.html">Portfolio</a>
<a class="font-['Epilogue'] font-black uppercase tracking-tighter text-black hover:bg-[#196ad4] hover:text-white transition-all duration-75 active:translate-x-1 active:translate-y-1" href="/canvas.html">Goals Canvas</a>
<a class="font-['Epilogue'] font-black uppercase tracking-tighter text-black hover:bg-[#196ad4] hover:text-white transition-all duration-75 active:translate-x-1 active:translate-y-1" href="/twin.html">Financial Twin</a>
</nav>
<div class="flex items-center gap-4">
<button class="neobrutalist-btn px-6 py-2">Join Herd</button>
<img alt="Mascot Profile" src="./cowIcons/peekingCow.png" class="w-10 h-10 border-2 border-black object-cover" />
</div>
</header>"""

footer_template = """<footer class="bg-stone-100 border-t-4 border-black w-full flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4 mt-12">
<div class="font-['Epilogue'] font-black text-lg text-black uppercase italic">MOORE MONEY</div>
<div class="flex gap-8">
<a class="font-['Epilogue'] font-medium text-sm text-stone-600 hover:underline decoration-2" href="#">Terms</a>
<a class="font-['Epilogue'] font-medium text-sm text-stone-600 hover:underline decoration-2" href="#">Privacy</a>
<a class="font-['Epilogue'] font-medium text-sm text-stone-600 hover:underline decoration-2" href="#">Doodle Guide</a>
</div>
<div class="font-['Epilogue'] font-medium text-sm text-stone-600">© 2026 MOORE MONEY - NO BULL.</div>
</footer>"""

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace head
    content = re.sub(r'<head>.*?</head>', head_template, content, flags=re.DOTALL)
    
    # Replace header
    content = re.sub(r'<header.*?</header>', header_template, content, flags=re.DOTALL)
    
    # Update body tag
    content = re.sub(r'<body.*?>', '<body class="bg-background text-on-background font-body-md overflow-x-hidden">', content)

    # Remove all rounded classes like rounded-full, rounded-xl, rounded-lg
    content = re.sub(r'rounded-(full|xl|lg|md|sm|\d+\w*)', 'rounded-none', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for filename in ['index.html', 'dashboard.html', 'canvas.html', 'twin.html']:
    path = os.path.join('/Users/cherylwang/Desktop/github/goldmanhack2026/frontend', filename)
    process_file(path)
