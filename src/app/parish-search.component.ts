import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { TitleCasePipe } from "@angular/common";
import * as L from "leaflet";
import { GeminiService } from "./gemini.service";

interface ParishResult {
  name: string;
  type: "church" | "school" | "other";
  address: string;
  lat: number;
  lng: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-parish-search",
  imports: [
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    TitleCasePipe,
  ],
  template: `
    <div class="h-full flex flex-col pt-16">
      <div
        class="p-6 shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200"
      >
        <h2 class="text-2xl font-serif text-cyril-purple mb-4">
          Find Your Parish
        </h2>
        <div class="flex gap-4">
          <input
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()"
            type="text"
            placeholder="Search by city, zip code, or parish name..."
            class="flex-1 w-full bg-stone-100 border-none rounded-xl px-4 py-3 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyril-purple/20 transition-all text-sm font-medium"
          />
          <button
            (click)="search()"
            [disabled]="loading()"
            class="bg-cyril-purple text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 disabled:opacity-50"
          >
            <mat-icon class="!text-sm">search</mat-icon>
            {{ loading() ? "Searching..." : "Search" }}
          </button>
        </div>
      </div>

      <div class="flex-1 flex min-h-0 relative z-10">
        <!-- Results Sidebar -->
        <div
          class="w-1/3 max-w-sm h-full bg-stone-50 border-r border-stone-200 overflow-y-auto"
        >
          @if (loading()) {
            <div class="p-8 text-center text-stone-500">
              <mat-icon class="animate-spin text-cyril-purple mb-2"
                >refresh</mat-icon
              >
              <p>Searching for Catholic parishes and schools...</p>
            </div>
          } @else if (results().length === 0 && hasSearched()) {
            <div class="p-8 text-center text-stone-500">
              <p>No results found. Try a broader search.</p>
            </div>
          } @else {
            <div class="p-4 space-y-4">
              @for (result of results(); track $index) {
                <div
                  (click)="focusOn(result)"
                  class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div class="flex items-start gap-3">
                    <mat-icon
                      [class]="
                        result.type === 'school'
                          ? 'text-amber-600'
                          : 'text-cyril-purple'
                      "
                    >
                      {{ result.type === "school" ? "school" : "church" }}
                    </mat-icon>
                    <div>
                      <h3 class="font-bold text-stone-900 leading-tight">
                        {{ result.name }}
                      </h3>
                      <p class="text-xs text-stone-500 mt-1">
                        {{ result.type | titlecase }}
                      </p>
                      <p class="text-xs text-stone-600 mt-2 line-clamp-2">
                        {{ result.address }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Map Area -->
        <div class="flex-1 relative">
          <div #mapContainer class="absolute inset-0"></div>
        </div>
      </div>
    </div>
  `,
})
export class ParishSearchComponent implements OnInit, OnDestroy {
  searchQuery = signal("");
  loading = signal(false);
  hasSearched = signal(false);
  results = signal<ParishResult[]>([]);

  @ViewChild("mapContainer", { static: true }) mapContainer!: ElementRef;
  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor(private gemini: GeminiService) {
    // Fix leafet marker icon issue
    const iconRetinaUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
    const iconUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
    const shadowUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngOnInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    // Default to US center
    this.map = L.map(this.mapContainer.nativeElement).setView(
      [39.8283, -98.5795],
      4,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);
  }

  async search() {
    if (!this.searchQuery().trim()) return;
    this.loading.set(true);
    this.hasSearched.set(true);

    try {
      // Use Nominatim to get the bounding box or center of the search area
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery())}&format=json&limit=1`,
      );
      const geocodeData = await geocodeRes.json();

      let lat = 39.8283;
      let lng = -98.5795;
      if (geocodeData && geocodeData.length > 0) {
        lat = parseFloat(geocodeData[0].lat);
        lng = parseFloat(geocodeData[0].lon);
        this.map.setView([lat, lng], 12);
      }

      // Use Gemini to semantically find Catholic parishes and disambiguate
      const prompt = `
        I need a list of Catholic churches, parishes, missions, cathedrals, and Catholic schools in or near "${this.searchQuery()}".
        If there are multiple entries for one location (e.g., a school, a church, a rental facility), carefully disambiguate them and list them as separate items if they are distinct entities.
        Focus primarily on churches. If there is a Catholic school, include it but mark the type as "school".
        
        Return ONLY a raw, valid JSON array of objects. Do not wrap it in markdown. 
        Each object must have: 
        - "name": string
        - "type": "church" | "school" | "other"
        - "address": string
        - "lat": number (approximate latitude)
        - "lng": number (approximate longitude)
        
        Use your Google Search tool if needed to find exact addresses and approximate coordinates. If you cannot find exact coordinates, approximate based on the city/street.
      `;

      const responseText = await this.gemini.searchParishes(prompt);

      // Parse the JSON array
      const matches = responseText.match(/\[(?:.|\\n)*\]/);
      let parsedResults: ParishResult[] = [];

      if (matches) {
        try {
          parsedResults = JSON.parse(matches[0]);
        } catch (e) {
          console.error("Failed to parse Gemini JSON:", e, matches[0]);
        }
      }

      this.results.set(parsedResults);
      this.updateMapMarkers();
    } catch (e) {
      console.error("Search failed:", e);
      alert("Failed to search parishes. Please try again.");
    } finally {
      this.loading.set(false);
    }
  }

  private updateMapMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const bounds = L.latLngBounds([]);

    this.results().forEach((result) => {
      if (result.lat && result.lng) {
        const marker = L.marker([result.lat, result.lng])
          .addTo(this.map)
          .bindPopup(`<b>${result.name}</b><br>${result.address}`);
        this.markers.push(marker);
        bounds.extend([result.lat, result.lng]);
      }
    });

    if (this.markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  focusOn(result: ParishResult) {
    if (result.lat && result.lng) {
      this.map.setView([result.lat, result.lng], 16);
      const marker = this.markers.find(
        (m) =>
          m.getLatLng().lat === result.lat && m.getLatLng().lng === result.lng,
      );
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
