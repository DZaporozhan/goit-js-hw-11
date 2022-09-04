import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import NewApiServise from './api-servise';

import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const newsApiServise = new NewApiServise();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onLoadMore() {
  addPhoto();
}
function slowScroll() {
  const { height: cardHeight } =
    refs.galleryContainer.firstElementChild.getBoundingClientRect();

  refs.galleryContainer.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
  if (
    refs.galleryContainer.scrollTop + refs.galleryContainer.clientHeight >=
    refs.galleryContainer.scrollHeight
  ) {
    addPhoto();
  }
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
  refs.loadMoreBtn.classList.add('is-hidden');
  newsApiServise.query = keys.value.split(' ').join('+').toLowerCase();

  newsApiServise.resetPage();

  clearMarkup();

  addPhoto();
  refs.galleryContainer.addEventListener('scroll', slowScroll);

  setTimeout(() => {
    Notify.info(`Hooray! We found ${newsApiServise.totalHits} images.`);
  }, 500);
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
        <a class="link" href="${largeImageURL}">
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

function addPhoto() {
  newsApiServise
    .getPhoto()
    .then(card => {
      const photoArr = card.hits;

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
      const lightbox = new SimpleLightbox('.gallery a');
      lightbox.refresh();

      console.log(data, newsApiServise.page);
      const total = (newsApiServise.page - 1) * 40;
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
