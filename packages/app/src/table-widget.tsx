import { useState } from "firejs";
import { Table } from "./table";
import { Widget } from "./widget";

const PRODUCTS = [
    "EBOB",
    "RBOB",
    "SING 95 Dubai Spread",
    "Naphtha",
    "Jet",
    "Fuel Oil",
];

const TENORS = ["Sep 25", "Oct 25", "Nov 25", "Dec 25"];

function getInitialPrices() {
    const prices = {};
    for (const product of PRODUCTS) {
        prices[product] = {};
        for (const tenor of TENORS) {
            prices[product][tenor] = 500 + Math.random() * 100; // random realistic price
        }
    }
    return prices;
}

export function TableWidget() {
    const [prices, setPrices] = useState(getInitialPrices());

    function randomizePrices() {
        setPrices(prices => {
            const newPrices = {};
            for (const product of PRODUCTS) {
                newPrices[product] = {};
                for (const tenor of TENORS) {
                    // Randomly change price by -5 to +5
                    const change = (Math.random() - 0.5) * 10;
                    newPrices[product][tenor] = Math.max(
                        0,
                        prices[product][tenor] + change,
                    );
                }
            }
            return newPrices;
        });
    }

    return (
        <div className="app-composition">
            <Widget
                title="Widget"
                children={
                    <Table products={PRODUCTS} tenors={TENORS} prices={prices} />
                }
            />
            <button onClick={randomizePrices} className="randomize-btn">
                Randomize Prices
            </button>
        </div>
    );
} 