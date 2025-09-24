import React from "react";
import ShopNavBar from "./ShopNavBar";

const ShopLayout = ({ children }) => (
    <div>
        <ShopNavBar />
        <main>{children}</main>
    </div>
);

export default ShopLayout;