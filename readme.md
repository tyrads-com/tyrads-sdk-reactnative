# tyrads-sdk

Tyrads SDK for React Native 

## Installation

```sh
npm install @tyrads.com/tyrads-sdk
# or
yarn add @tyrads.com/tyrads-sdk
```

## Usage


```js
import Tyrads, { PremiumOffersWidget, PremiumWidgetStyles } from '@tyrads.com/tyrads-sdk';

// 1. Initialize the SDK
// Tyrads.init(apiKey, apiSecret, encKey?, engagementId?, placementId?, mediaSourceInfo?, userInfo?, config?)
await Tyrads.init('YOUR_API_KEY', 'YOUR_API_SECRET');

// 2. Login User
await Tyrads.loginUser('user123');

// 3. Show Offerwall
await Tyrads.showOffers();
```

### Premium Offers Widget (v4+)
You can render premium offers natively inside your app views using the provided React components:

```jsx
import { PremiumOffersWidget, PremiumOffersWidgetLoading, PremiumWidgetStyles } from '@tyrads.com/tyrads-sdk';

// Inside your screen/component:
<PremiumOffersWidget widgetStyle={PremiumWidgetStyles.list} />
```


</br>
<details>
<summary><strong>Launch Mode</strong></summary>


</br>

##### Min SDK version required: v1.1.6
##### Works only for iOS 

</br>

Tyrads SDK provides the ability to open the Offerwall in a webkit view that is embedded in the app to provide a seamless user experience. Also, it provides the ability to open the Offerwall in an external browser (Safari) if Apple's app store policy does not approve the in-app rewards system for the app.

Available launch modes:
- `launchMode: 3` - opens the Offerwall in an external browser (Safari)
- `launchMode: 2` - opens the Offerwall in a webkit view that is embedded in the app

```js

// Note: The launchMode parameter is optional, if not specified the default would be opening the Offerwall in an external browser (Safari)

await Tyrads.showOffers({ launchMode: 3 });// provide launchMode: 2 to open the Offerwall in a webkit view that is embedded in the app

```
</details>



</br>
<details>
<summary><strong>Deeplinking Routes</strong></summary>


</br>

##### Min SDK version required: v4.0.0-beta.0

</br>

The Tyrads SDK supports deeplinking to specific sections of the offerwall. When initializing or interacting with the SDK, you can specify a route to open a particular page. For campaign-specific routes, you'll need to provide the campaignID as well.

Available routes and their usage:
- `offers` - opens the Campaigns Page
- `active-offers` - opens the Activated Campaigns Page
- `offers` with campaignID - opens the Campaign Details Page (requires campaignID)
- `support` with campaignID - opens the Campaign Tickets Page (requires campaignID)

```js

// Default route (Campaigns Page)
await Tyrads.showOffers();

// Explicitly specifying the Campaigns Page
await Tyrads.showOffers({ route: "offers" });

// Activated Campaigns Page
await Tyrads.showOffers({ route: "active-offers" });

// Campaign Details Page (requires campaignID)
await Tyrads.showOffers({ route: "offers", campaignID: "your_campaign_id_here" });

// Campaign Tickets Page (requires campaignID)
await Tyrads.showOffers({ route: "support", campaignID: "your_campaign_id_here" });

```
</details>

</br></br>

