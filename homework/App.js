'use strict';

/* global Util, Repository, Contributor */

class App {
  constructor(url) {
    this.initialize(url);
  }

  /**
   * Initialization
   * @param {string} url The GitHub URL for obtaining the organization's repositories.
   */
  async initialize(url) {
    createLayout();
    // Add code here to initialize your app
    // 1. Create the fixed HTML elements of your page
    // 2. Make an initial XMLHttpRequest using Util.fetchJSON() to populate your <select> element

    const root = document.getElementById('root');

    try {
      const repos = await Util.fetchJSON(url);
      let arrayOfRepos = this.repos = repos.map(repo => new Repository(repo));
      console.log(arrayOfRepos[0].keys);
      for (let i = 0; i < arrayOfRepos.length; i++) {
        console.log(arrayOfRepos[i].name);
      }
    } catch (error) {
      this.renderError(error);
    }
  }

  /**
   * Removes all child elements from a container element
   * @param {*} container Container element to clear
   */
  static clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  /**
   * Fetch contributor information for the selected repository and render the
   * repo and its contributors as HTML elements in the DOM.
   * @param {number} index The array index of the repository.
   */
  async fetchContributorsAndRender(index) {
    try {
      const repo = this.repos[index];
      const contributors = await repo.fetchContributors();

      const container = document.getElementById('container');
      App.clearContainer(container);

      const leftDiv = Util.createAndAppend('div', container);
      const rightDiv = Util.createAndAppend('div', container);

      const contributorList = Util.createAndAppend('ul', rightDiv);

      repo.render(leftDiv);

      contributors
        .map(contributor => new Contributor(contributor))
        .forEach(contributor => contributor.render(contributorList));
    } catch (error) {
      this.renderError(error);
    }
  }

  /**
   * Render an error to the DOM.
   * @param {Error} error An Error object describing the error.
   */
  renderError(error) {
    console.log(error); // TODO: replace with your own code
  }
}

function createLayout() {
  const root = document.getElementById('root');
  Util.createAndAppend('select', root, { id: 'repo-select' });
  Util.createAndAppend('option', document.getElementById('repo-select'), { text: 'Choose a Repository' });
  Util.createAndAppend('div', root, { id: 'body-container' });
  Util.createAndAppend('div', document.getElementById('body-container'), { id: 'repo-details' });
  Util.createAndAppend('div', document.getElementById('body-container'), { id: 'contributors' });

}

const HYF_REPOS_URL = 'https://api.github.com/orgs/FooCoding/repos?per_page=100';

window.onload = () => new App(HYF_REPOS_URL);
