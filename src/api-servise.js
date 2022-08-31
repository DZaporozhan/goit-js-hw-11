import axios from 'axios';

export default class NewApiServise {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.totalHits = null;
  }

  async getPhoto() {
    try {
      const url = 'https://pixabay.com/api/';
      const options = {
        params: {
          key: '29555599-b6225d531790a6eb880d69b1e',
          q: `${this.searchQuery}`,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: 'true',
          page: this.page,
          per_page: 40,
        },
      };
      const response = await axios.get(url, options);
      this.totalHits = response.data.totalHits;
      this.page += 1;

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
