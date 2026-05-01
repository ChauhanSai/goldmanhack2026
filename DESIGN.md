---
name: Moore Money Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fc'
  surface-container: '#ecedf7'
  surface-container-high: '#e7e8f1'
  surface-container-highest: '#e1e2eb'
  on-surface: '#191c22'
  on-surface-variant: '#424753'
  inverse-surface: '#2e3037'
  inverse-on-surface: '#eff0fa'
  outline: '#727784'
  outline-variant: '#c2c6d5'
  surface-tint: '#005bbf'
  primary: '#0052ac'
  on-primary: '#ffffff'
  primary-container: '#196ad4'
  on-primary-container: '#ecf0ff'
  inverse-primary: '#acc7ff'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#8e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b44f00'
  on-tertiary-container: '#ffede5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004492'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68f'
  on-tertiary-fixed: '#331100'
  on-tertiary-fixed-variant: '#773200'
  background: '#f9f9ff'
  on-background: '#191c22'
  surface-variant: '#e1e2eb'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system establishes a visual language that balances the financial gravity of a money-management tool with a disarming, rebellious "Doodle Neobrutalist" aesthetic. The brand personality is unapologetic, energetic, and human. By mixing the harsh, structural rigidity of Neobrutalism with the organic imperfection of hand-drawn sketches, the UI removes the intimidation factor often associated with finance.

The target audience is a younger, digitally native demographic that values transparency and authenticity over corporate polish. The emotional response should be one of "structured chaos"—where the information is clear and accessible, but the delivery feels like a collaborative sketch on a whiteboard. High-contrast elements and bold "ink" strokes ensure the interface remains high-utility while maintaining its distinctive artistic edge.

## Colors

The color palette is strictly limited to maintain the high-impact "ink-on-paper" feel. 

- **Primary Blue (#196ad4):** Used exclusively for key actions, interactive states, and highlighting critical financial data. It is the only chromatic color allowed in the system.
- **Surface & Off-White:** Pure #FFFFFF is used for the primary canvas. #FAFAFA is reserved for secondary containers or "paper" layers to create subtle distinction without losing contrast.
- **Deep Black:** All borders, typography, and "doodle" elements use a solid #000000. There are no grays or opacities used for text or lines; if it’s on the screen, it should look like it was drawn with a thick felt-tip marker.

## Typography

The typography system relies on a heavy-weight contrast between "The Statement" and "The Detail." 

**Epilogue** is the voice of the system. It should be used at extremely heavy weights (800+) for all headings. The tight letter spacing and chunky letterforms mimic the appearance of bolded hand-lettering.

**Work Sans** provides the functional balance. Its clean, geometric architecture ensures that financial figures and long-form text remain legible against the energetic backdrop of the design system. Use bold weights for labels to ensure they stand up against the thick 3px and 4px borders used in the layout.

## Layout & Spacing

This design system uses a **Fixed Grid** model that emphasizes blocky, modular sections. Everything is contained within defined "cells" that look like they've been boxed out on a page.

- **Grid:** A 12-column grid is used for desktop, but elements should rarely feel perfectly aligned. Layouts should utilize slight offsets or staggered placements to maintain the "sketched" energy.
- **Rhythm:** Spacing follows an 8px base unit. However, internal padding within cards and containers should be generous (24px+) to prevent the thick black borders from feeling claustrophobic.
- **Margins:** External page margins are kept wide to frame the content as a central composition, similar to a focused drawing in the middle of a sketchbook page.

## Elevation & Depth

Depth in this system is achieved through **Neobrutalist Hard Shadows**, not gradients or blurs.

- **The "Lift":** Elevation is represented by a solid black offset shadow (usually 4px or 8px) with 100% opacity. This creates a "3D pop" effect where elements look like thick wooden blocks or stickers.
- **Interaction Depth:** When an element is pressed or "active," the shadow offset should decrease to 0px, making the element appear to be pushed into the surface.
- **No Blurs:** Gaussian blurs, soft shadows, and semi-transparency are strictly prohibited. Every layer transition must be sharp and defined by a black stroke or a hard-edged shadow block.

## Shapes

The shape language is primarily **Sharp (0px)** to lean into the Brutalist influence. However, to incorporate the "Doodle" aspect, specific rules apply:

- **Containers:** All primary cards and buttons use 90-degree sharp corners with a 3px or 4px solid black border.
- **Organic Lines:** While the containers are rigid, the internal visual elements—such as the cow mascot and hand-drawn icons—feature variable line weights and intentionally "wobbly" strokes.
- **The "Doodle" Stroke:** Any hand-drawn element should look like it was created with a single-pass ink stroke, showing slight imperfections at the start and end of lines.

## Components

### Buttons
Primary buttons are solid #196ad4 with a 4px black border and a 4px black bottom-right hard shadow. Text is white or black Epilogue Bold. On hover, the shadow grows; on click, the button shifts down to "cover" the shadow.

### Cards
Cards are white-fill containers with a 3px black border. They often feature a "doodle" element—like a small cow ear peeking over the top border or a hand-drawn arrow pointing to the CTA.

### Input Fields
Inputs use a thick 2px border. The focus state is indicated by the primary #196ad4 color filling the border, accompanied by a small hand-drawn "asterisk" or "check" doodle that appears to the right.

### The Mascot (Moore the Cow)
The doodled cow mascot acts as a functional guide. Use the mascot for:
- **Empty States:** A sad cow looking at an empty trough.
- **Success States:** A cow wearing sunglasses.
- **Loading:** A cow running in a playful, hand-drawn loop.

### Hand-Drawn Icons
All icons must be custom-drawn with a variable line weight (2pt to 4pt). They should look "human" and slightly asymmetrical. Avoid using standard icon libraries; if a standard icon is needed, it must be traced by hand to match the system's "ink" style.