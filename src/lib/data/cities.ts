import type { SelectedLocation } from "../types";

/** Popular pickup areas used by the location selector. */
export const LOCATIONS: SelectedLocation[] = [
  { label: "Rīga, Centrs", lat: 56.9515, lng: 24.1163 },
  { label: "Rīga, Vecrīga", lat: 56.9489, lng: 24.1064 },
  { label: "Rīga, Āgenskalns", lat: 56.9339, lng: 24.0722 },
  { label: "Rīga, Purvciems", lat: 56.9594, lng: 24.1913 },
  { label: "Rīga, Ķengarags", lat: 56.9128, lng: 24.1774 },
  { label: "Rīga, Teika", lat: 56.9723, lng: 24.1682 },
  { label: "Jūrmala, Majori", lat: 56.9715, lng: 23.7947 },
  { label: "Liepāja", lat: 56.5047, lng: 21.0108 },
  { label: "Daugavpils", lat: 55.8747, lng: 26.5364 },
  { label: "Valmiera", lat: 57.5383, lng: 25.4266 },
  { label: "Cēsis", lat: 57.3122, lng: 25.2749 },
  { label: "Sigulda", lat: 57.1537, lng: 24.8598 },
];

export const DEFAULT_LOCATION: SelectedLocation = LOCATIONS[0];
