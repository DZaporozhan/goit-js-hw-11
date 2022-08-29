import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;
let keyString = '';
let qsHits = '';

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onLoadMore() {
  addPhoto(keyString);
}

function onSearch(e) {
  e.preventDefault();

  const {
    elements: { searchQuery: keys },
  } = e.currentTarget;

  if (!keys.value) {
    clearMarkup();
    page = 1;
    return;
  }

  keyString = keys.value.split(' ').join('+').toLowerCase();
  console.log(keyString);

  page = 1;

  clearMarkup();

  addPhoto(keyString);
  setTimeout(() => {
    Notify.info(`Hooray! We found ${qsHits} images.`);
  }, 500);
}

async function getPhoto(keyWord) {
  try {
    const url = 'https://pixabay.com/api/';
    const options = {
      params: {
        key: '29555599-b6225d531790a6eb880d69b1e',
        q: `${keyWord}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: 40,
      },
    };
    const response = await axios.get(url, options);
    page += 1;

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function renderGallery(data) {
  const markup = markupGallery(data);
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
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

function addPhoto(searchQuery) {
  getPhoto(searchQuery)
    .then(card => {
      const photoArr = card.hits;
      qsHits = card.totalHits;

      if (!photoArr[0]) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      renderGallery(photoArr);
      refs.loadMoreBtn.classList.remove('is-hidden');
      return card;
    })
    .then(data => {
      console.log(data, page);
      const total = (page - 1) * 40;
      if (data.totalHits <= total) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch();
}

function clearMarkup() {
  refs.galleryContainer.innerHTML = '';
}
