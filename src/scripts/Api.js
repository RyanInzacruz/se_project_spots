class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "17519b6c-695d-4c39-b5ba-bb91311977b9",
      },
    }).then((res) => res.json());
  }

  // other methods for working with the API
}

export default Api;
