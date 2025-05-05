export interface VintedItem {
    id: number;
    title: string;
    price: string;
    url: string;
}

let latestItems: VintedItem[] = [];

export function addItem(item: VintedItem): void {
    // Évite les doublons
    if (!latestItems.find((i) => i.id === item.id)) {
        latestItems.unshift(item); // Ajoute en haut
        if (latestItems.length > 20) latestItems.pop(); // Max 20
    }
}

export function getItems(): VintedItem[] {
    return latestItems;
}
