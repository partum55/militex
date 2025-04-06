import React from "react";
import { Link } from "react-router-dom";

function BuyPage() {
    return   (
    <>
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#EDEDED', overflow: 'hidden'}}>
            <div style={{width: 1222, height: 66, left: 550, top: 153, position: 'absolute', background: '#D9D9D9', borderRadius: 32}} />
            <div style={{width: 398, height: 569.50, left: 128, top: 139, position: 'absolute', background: '#D9D9D9'}} />
            <div style={{width: 354, height: 76, left: 152, top: 531, position: 'absolute', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Sedan</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Estate</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#2F313C', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: 'white', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>SUV</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Pickup</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Hatchback</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Liftback</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Coupe</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Fastback</div>
                </div>
                <div style={{width: 80, height: 36, paddingLeft: 15, paddingRight: 15, paddingTop: 7, paddingBottom: 7, background: '#D9D9D9', overflow: 'hidden', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{color: '#2F313C', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', wordWrap: 'break-word'}}>Hardtop</div>
                </div>
            </div>
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 569, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>новинки!</div>
                </div>
            </div>
            <div style={{left: 160, top: 186, position: 'absolute', color: '#39236B', fontSize: 16, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Price Range</div>
            <div style={{left: 182, top: 3308, position: 'absolute', color: '#39236B', fontSize: 32, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Previous</div>
            <div style={{left: 1673, top: 3308, position: 'absolute', color: '#39236B', fontSize: 32, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Next</div>
            <div style={{left: 160, top: 258, position: 'absolute', color: '#39236B', fontSize: 16, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Millage</div>
            <div style={{left: 160, top: 330, position: 'absolute', color: '#39236B', fontSize: 16, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Seller rating</div>
            <div style={{width: 324, height: 8, left: 160, top: 220, position: 'absolute', background: 'white', borderRadius: 10}} />
            <div style={{width: 324, height: 8, left: 160, top: 364, position: 'absolute', background: 'white', borderRadius: 10}} />
            <div style={{width: 18, height: 18, left: 198, top: 215, position: 'absolute', background: '#39236B', borderRadius: 9999}} />
            <div style={{width: 18, height: 18, left: 425, top: 215, position: 'absolute', background: '#39236B', borderRadius: 9999}} />
            <div style={{width: 227, height: 8, left: 206, top: 220, position: 'absolute', background: '#39236B', borderRadius: 10}} />
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 1032, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>потрібен ремонт</div>
                </div>
            </div>
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 1341, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>для гуманітарки</div>
                </div>
            </div>
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 1187, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>на ходу</div>
                </div>
            </div>
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 878, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>майже нові</div>
                </div>
            </div>
            <div data-configuration="Label only" data-selected="False" data-show-closing-icon="false" data-state="Enabled" style={{width: 126, height: 52, left: 723, top: 262, position: 'absolute', overflow: 'hidden', borderRadius: 32, outline: '1px var(--Schemes-Outline-Variant, #CAC4D0) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Schemes-On-Surface-Variant, #49454F)', fontSize: 14, fontFamily: 'Roboto', fontWeight: '500', lineHeight: 20, letterSpacing: 0.10, wordWrap: 'break-word'}}>найдешевші</div>
                </div>
            </div>
            <div data-size="48" style={{width: 48, height: 48, left: 470, top: 164, position: 'absolute', overflow: 'hidden'}}>
                <div style={{width: 40, height: 36, left: 4, top: 6, position: 'absolute', outline: '4px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-2px'}} />
            </div>
            <div data-dark-mode="False" data-search-style="Filled" style={{width: 1206, height: 50, paddingLeft: 18, paddingRight: 18, left: 558, top: 161, position: 'absolute', background: '#ECECEC', borderRadius: 32, justifyContent: 'flex-start', alignItems: 'center', gap: 9, display: 'inline-flex'}} />
            <div data-size="48" style={{width: 48, height: 48, left: 569, top: 164, position: 'absolute', overflow: 'hidden'}}>
                <div style={{width: 36, height: 36, left: 6, top: 6, position: 'absolute', outline: '4px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-2px'}} />
            </div>
            <div style={{left: 632, top: 164, position: 'absolute', textAlign: 'center', color: '#00071A', fontSize: 32, fontFamily: 'Nunito', fontWeight: '700', wordWrap: 'break-word'}}>Search</div>
            <div style={{width: 1920, height: 64, left: 0, top: 0, position: 'absolute'}}>
                <div style={{width: 1920, height: 64, left: 0, top: 0, position: 'absolute', background: '#39236B'}} />
                <Link to="/" style={{width: 216, height: 64, left: 288, top: 0, position: 'absolute', textDecoration: 'none'}}>
                    <div style={{width: 208, height: 48, left: 4, top: 8, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#EDEDED', fontSize: 20, fontFamily: 'Nunito', fontWeight: '400', wordWrap: 'break-word'}}>Home</div>
                </Link>
                <Link to="/buy" style={{width: 216, height: 64, left: 504, top: 0, position: 'absolute', textDecoration: 'none'}}>
                    <div style={{width: 208, height: 48, left: 4, top: 8, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#EDEDED', fontSize: 20, fontFamily: 'Nunito', fontWeight: '400', wordWrap: 'break-word'}}>Buy</div>
                </Link>
                <Link to="/sell" style={{width: 216, height: 64, left: 720, top: 0, position: 'absolute', textDecoration: 'none'}}>
                    <div style={{width: 208, height: 48, left: 4, top: 8, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#EDEDED', fontSize: 20, fontFamily: 'Nunito', fontWeight: '400', wordWrap: 'break-word'}}>Sell</div>
                </Link>
                <Link to="/fundraiser" style={{width: 216, height: 64, left: 936, top: 0, position: 'absolute', textDecoration: 'none'}}>
                    <div style={{width: 208, height: 48, left: 4, top: 8, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#EDEDED', fontSize: 20, fontFamily: 'Nunito', fontWeight: '400', wordWrap: 'break-word'}}>Foundraiser</div>
                </Link>
                <div data-property-1="white" style={{width: 64, height: 64, left: 128, top: 0, position: 'absolute'}}>
                    <img style={{width: 64, height: 64, left: 0, top: 0, position: 'absolute'}} src="https://placehold.co/64x64" />
                </div>
                <div data-property-1="light" style={{width: 32, height: 32, left: 1552, top: 16, position: 'absolute'}}>
                    <div style={{width: 32, height: 32, left: 0, top: 0, position: 'absolute', background: '#EDEDED'}} />
                </div>
                <div data-property-1="default" style={{width: 32, height: 32, left: 1648, top: 16, position: 'absolute'}}>
                    <div style={{width: 32, height: 32, left: 0, top: 0, position: 'absolute', background: '#EDEDED'}} />
                </div>
                <div data-property-1="default" style={{width: 32, height: 32, left: 1744, top: 16, position: 'absolute'}}>
                    <div style={{width: 32, height: 32, left: 0, top: 0, position: 'absolute', background: 'white'}} />
                </div>
            </div>
        </div>
    </>
    );
}

export default BuyPage;