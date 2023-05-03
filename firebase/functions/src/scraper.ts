import * as functions from "firebase-functions";
import axios from "axios";
import db from "./db";
import { GeoPoint, Timestamp } from "@google-cloud/firestore";

const Locations = {
  toronto: {
    latitiude: 43.662892,
    longitude: -79.395656,
  },
};

interface ISpotData {
  availability: {
    available: boolean;
    unavailable_reasons: string[];
    available_spaces: number;
  };
  distance: {
    linear_meters: number;
  };
  facility: {
    common: {
      id: string;
      status: string;
      title: string;
      slug: string;
      addresses: {
        id: string;
        city: string;
        latitude: number;
        longitude: number;
        state: string;
        street_address: string;
        time_zone: string;
        country: string;
        types: string[];
        postal_code: string;
      }[];
      cancellation: {
        allowed_by_customer: boolean;
        allowed_by_spothero_customer_service: boolean;
        minutes: number;
      };
      description: string;
      facility_type: string;
      navigation_tip: string;
      clearance_inches: number | null;
      hours_of_operation: {
        periods: {
          day_of_week: string;
          start_time_secs: number;
          end_time_secs: 0;
          hours_type: string;
          first_day: string;
          last_day: string;
          start_time: string;
          end_time: string;
        }[];
        always_open: boolean;
        text: string[];
      };
      images: { id: string; url: string; alt_text: string }[];
      parking_types: string[];
      rating: {
        average: number;
        count: number;
      };
      restrictions: string[];
      requirements: {
        printout: boolean;
        license_plate: boolean;
        phone_number: boolean;
      };
      supported_fee_types: string[];
      reservation_extension_enabled: boolean;
      visual_flags: string[];
      operator_display_name: string;
    };
    transient: {
      redemption_instructions: {
        drive_up: {
          id: string;
          illustration: {
            id: string;
            url: string;
            alt_text: string;
          };
          text: string;
        }[];
      };
      is_commuter_card_eligible: boolean;
    };
  };
  options: {
    commuter_card_eligible: string;
  };
  rates: {
    transient: {
      redemption_type: string;
      parking_pass: {
        type: string;
        display_name: string;
      };
      amenities: {
        type: string;
        display_name: string;
        description: string;
      }[];
      early_bird: boolean | null;
    };
    quote: {
      order: [
        {
          facility_id: string;
          starts: string;
          ends: string;
          rate_id: string;
          items: {
            price: {
              value: number;
              currency_code: string;
            };
            type: string;
            short_description: string;
            full_description: string;
          }[];
          total_price: {
            value: number;
            currency_code: string;
          };
          meta: object;
        }
      ];
      items: {
        price: {
          value: number;
          currency_code: string;
        };
        type: string;
        short_description: string;
        full_description: string;
      }[];
      total_price: {
        value: number;
        currency_code: string;
      };
      advertised_price: {
        value: number;
        currency_code: string;
      };
      meta: {
        quote_mac: string;
        quote_valid_until: string;
        partner_id: string;
      };
    };
  }[];
}

interface FSpotData {
  bookedBy: string;
  bookedFrom: Timestamp;
  bookedTo: Timestamp;
  address: string;
  city: string;
  cost: number;
  country: string;
  description: string;
  electric_charger: boolean;
  geopoint: GeoPoint;
  image_urls: string[];
  num_spots: number;
  parking_space_type: string;
  type: string;
  vehicle_size_type: string;
  startDate: Timestamp;
  endDate: Timestamp;
  url: string;
  createdBy: string;
}

export const getSpots = functions.https.onRequest(async (request, response) => {
  const commercialSpots = await db
    .collection("locations/toronto/spots")
    .where("type", "==", "commercial")
    .get();

  const deleteBatch = db.batch();

  commercialSpots.forEach((doc) => {
    deleteBatch.delete(doc.ref);
  });

  await deleteBatch.commit();

  const rad = 2500;

  const results: {
    data: {
      results: ISpotData[];
      "@next": string;
    };
  }[] = await Promise.all(
    Object.entries(Locations).map(async ([city, { longitude, latitiude }]) =>
      axios.get(`https://api.spothero.com/v2/search/transient?page_size=100&include
        _walking_distance=true&lat=${latitiude}&lon=${longitude}&max_distance_meters=${rad}`)
    )
  );

  const parsedResults: FSpotData[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  results.forEach((result) => {
    result.data.results.forEach((rawData) => {
      const defaultTimestamp: Timestamp = Timestamp.now();
      parsedResults.push({
        bookedBy: "",
        bookedFrom: defaultTimestamp,
        bookedTo: defaultTimestamp,
        address: rawData.facility.common.addresses[0].street_address,
        city: rawData.facility.common.addresses[0].city.toLowerCase(),
        cost: rawData.rates[0].quote.total_price.value / 100,
        country: "Canada",
        description: rawData.facility.common.description,
        electric_charger: false,
        geopoint: new GeoPoint(
          rawData.facility.common.addresses[0].latitude,
          rawData.facility.common.addresses[0].longitude
        ),
        image_urls: rawData.facility.common.images.map(({ url }) => url),
        num_spots: rawData.availability.available_spaces,
        parking_space_type: "Multilevel Parking Garage",
        type: "commercial",
        vehicle_size_type: "Large(e.g. Volvo XC90)",
        url: `https://spothero.com/search?spot-id=${rawData.facility.common.id}`,
        startDate: Timestamp.fromDate(today),
        endDate: Timestamp.fromDate(tomorrow),
        createdBy: "SpotHero",
      });
    });
  });

  const batch = db.batch();

  parsedResults.forEach((doc) => {
    const docRef = db.collection("locations/toronto/spots").doc();
    batch.set(docRef, doc);
  });

  await batch.commit();

  response.json(parsedResults);
});

export const getAverage = functions.https.onRequest(async (request, response) => {
  const spots = await db.collection("locations/toronto/spots").get();
  let count = 0;
  let average = 0;
  spots.forEach((spot) => {
    const data = spot.data();
    console.log(data);
    average += data.cost;
    count += 1;
  });
  average = count == 0 ? average : average / count;
  average = Math.round((average + Number.EPSILON) * 100) / 100;

  const docRef = db.doc("locations/toronto");
  await docRef.update({ average_cost: average });

  // Rounds to two decimal places
  response.json({ Result: average });
});
