import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onLoadMore() {
  page += 1;
}

function onSearch(e) {
  e.preventDefault();

  const {
    elements: { searchQuery: keys },
  } = e.currentTarget;

  const keyString = keys.value.split(' ').join('+').toLowerCase();
  console.log(keyString);

  if (!keyString) {
    clearMarkup();
    return;
  }
  refs.loadMoreBtn.classList.remove('is-hidden');

  getPhoto(keyString)
    .then(card => {
      const photoArr = card.hits;
      console.log(photoArr);
      if (!photoArr[0]) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      renderGallery(photoArr);
    })
    .catch();
}

async function getPhoto(keyWord) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '29555599-b6225d531790a6eb880d69b1e',
        q: `${keyWord}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: 40,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function renderGallery(data) {
  const markup = markupGallery(data);
  refs.galleryContainer.innerHTML = markup;
}

function markupGallery(data) {
  const markup = data
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <a class="gallery__link" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');

  return markup;
}

function clearMarkup() {
  refs.galleryContainer.innerHTML = '';
}
