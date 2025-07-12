import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import logoImgSrc from "../images/logo.svg";
import profilePicSrc from "../images/avatar.jpg";
import pencilIconSrc from "../images/Pencil.svg";
import plusIconSrc from "../images/Plus.svg";
import closeIconSrc from "../images/close.svg";
import pencilIconLightSrc from "../images/pencil-light.svg";
import Api from "../utils/Api.js";

// INITIALIZATIONS

// Instantiate API
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "17519b6c-695d-4c39-b5ba-bb91311977b9",
    "Content-Type": "application/json",
  },
});

// Load images
document.getElementById("logo-image").src = logoImgSrc;
document.getElementById("profile-picture").src = profilePicSrc;
document.getElementById("pencil-icon").src = pencilIconSrc;
document.getElementById("plus-icon").src = plusIconSrc;
document.querySelectorAll(".close-icon").forEach((icon) => {
  icon.src = closeIconSrc;
  document.getElementById("profile__pencil-icon").src = pencilIconLightSrc;
});

// GLOBAL DOM ELEMENTS

// Profile elements
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profilePic = document.getElementById("profile-picture");

// Card elements
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

// Edit profile modal
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

// New post modal
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardForm = newPostModal.querySelector(".modal__form");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const newPostLink = newPostModal.querySelector("#card-image-input");
const newPostCaption = newPostModal.querySelector("#card-caption-input");

// Avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarLink = avatarModal.querySelector("#profile-avatar-input");

// Preview modal
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn-type-preview"
);
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// Confirm delete modal
const confirmDeleteModal = document.querySelector("#confirm-delete-modal");
const confirmDeleteBtn = document.querySelector("#confirm-delete-btn");
const cancelDeleteBtn = document.querySelector("#cancel-delete-btn");
const confirmDeleteCloseBtn =
  confirmDeleteModal.querySelector(".modal__close-btn");

// API GET DATA

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    profilePic.src = userInfo.avatar;

    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardList.append(cardElement);
    });
  })
  .catch(console.error);

// MODAL FUNCTIONS

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
  modal.addEventListener("mousedown", handleOutsideClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
  modal.removeEventListener("mousedown", handleOutsideClick);
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

function handleOutsideClick(evt) {
  if (evt.target.classList.contains("modal")) closeModal(evt.target);
}

// CARD RENDERING FUNCTION

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  cardElement.dataset.cardId = data._id;

  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  // Like button functionality
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  cardLikeBtnEl.addEventListener("click", () => {
    const cardId = data._id;
    if (cardLikeBtnEl.classList.contains("card__like-btn_active")) {
      api
        .removeLike(cardId)
        .then(() => cardLikeBtnEl.classList.remove("card__like-btn_active"))
        .catch(console.error);
    } else {
      api
        .addLike(cardId)
        .then(() => cardLikeBtnEl.classList.add("card__like-btn_active"))
        .catch(console.error);
    }
  });

  // Delete button functionality
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  cardDeleteBtnEl.addEventListener("click", () =>
    openConfirmDeleteModal(cardElement)
  );

  // Image preview functionality
  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

// EDIT PROFILE FUNCTION

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const editProfileSubmitBtn =
    editProfileForm.querySelector(".modal__submit-btn");
  editProfileSubmitBtn.textContent = "Saving...";
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      editProfileSubmitBtn.textContent = "Save";
    });
}

// NEW POST FUNCTION

function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const newPostSubmitBtn = addCardForm.querySelector(".modal__submit-btn");
  newPostSubmitBtn.textContent = "Saving...";

  const inputValues = {
    name: newPostCaption.value,
    link: newPostLink.value,
  };

  api
    .addCard(inputValues)
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardList.prepend(cardElement);
      evt.target.reset();
      disableButton(newPostSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      newPostSubmitBtn.textContent = "Create";
    });
}

// DELETE CARD FUNCTIONS

let selectedCard = null;
let selectedCardId = null;

function openConfirmDeleteModal(cardElement) {
  selectedCard = cardElement;
  selectedCardId = cardElement.dataset.cardId;
  openModal(confirmDeleteModal);
}

confirmDeleteBtn.addEventListener("click", () => {
  confirmDeleteBtn.textContent = "Deleting...";
  if (selectedCard && selectedCardId) {
    api
      .deleteCard(selectedCardId)
      .then(() => {
        selectedCard.remove();
        selectedCard = null;
        selectedCardId = null;
        closeModal(confirmDeleteModal);
      })
      .catch(console.error);
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  selectedCard = null;
  selectedCardId = null;
  closeModal(confirmDeleteModal);
});

confirmDeleteCloseBtn.addEventListener("click", () =>
  closeModal(confirmDeleteModal)
);

// EVENT LISTENERS

// Edit profile modal
editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal)
);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// New post modal
newPostBtn.addEventListener("click", () => openModal(newPostModal));
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
addCardForm.addEventListener("submit", handleNewPostSubmit);

// Edit avatar modal
avatarModalBtn.addEventListener("click", () => {
  avatarForm.reset();
  resetValidation(avatarForm, [avatarLink], settings);
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);
avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  avatarSubmitBtn.textContent = "Saving...";
  api
    .editAvatar({ avatar: avatarLink.value })
    .then((userData) => {
      profilePic.src = userData.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = "Save";
    });
}

// Preview modal close
previewModal.addEventListener("click", () => closeModal(previewModal));

// VALIDATION

enableValidation(settings);

// Will eventually delete these inital cards

// const initialCards = [
//   {
//     name: "Golden Gate Bridge",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
//   },
//   {
//     name: "Val Thorens",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
//   {
//     name: "Restaurant terrace",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
//   },
//   {
//     name: "An outdoor cafe",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
//   },
//   {
//     name: "A very long bridge, over the forest and through the trees",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
//   },
//   {
//     name: "Tunnel with morning light",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
//   },
//   {
//     name: "Mountain house",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
// ];
