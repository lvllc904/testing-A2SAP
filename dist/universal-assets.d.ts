export interface ValueElement {
    id: number;
    symbol: string;
    name: string;
    tier: 'fiat' | 'crypto' | 'equity' | 'commodity' | 'bond';
    baseDecimals: number;
    canonicalUnitValueUsd: number;
    seriesSpv: string;
    underlyingPhysicalAnchor: string;
    color: string;
}
export declare const UNIVERSAL_VALUE_ELEMENTS: ValueElement[];
export declare class HolographicUnitRegistry {
    private elements;
    private symbolIndex;
    constructor();
    getById(id: number): ValueElement | undefined;
    getBySymbol(symbol: string): ValueElement | undefined;
    getAll(): ValueElement[];
    /**
     * Deterministic cross-rate between exactly 1 unit of Asset A and 1 unit of Asset B
     */
    calculateHolographicRate(srcId: number, tgtId: number): number;
}
