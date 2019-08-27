'use strict';

{
  function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';
      xhr.onload = function () {
        if (xhr.status < 400) {
          resolve(xhr.response);
        } else {
          reject(Error(xhr.status));
        }
      };
      xhr.onerror = () => {
        reject(Error('Network request failed'));
      }
      xhr.send();  
    });
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function createLayout() {
    const root = document.getElementById('root');
    createAndAppend('select', root, { id: 'repo-select' });
    createAndAppend('option', document.getElementById('repo-select'), { text: 'Choose a Repository' });
    createAndAppend('div', root, { id: 'body-container' });
    createAndAppend('div', document.getElementById('body-container'), { id: 'repo-details' });
    createAndAppend('div', document.getElementById('body-container'), { id: 'contributors' });

  }

  async function getRepoDataFromOrgAndAddToDOM() {
    const REPOS_URL = 'https://api.github.com/orgs/foocoding/repos?per_page=100';
    try {
      let response = await fetchJSON(REPOS_URL);
      response.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
      response.forEach(repoDataObj => {
        createAndAppend('option', document.getElementById('repo-select'), { text: repoDataObj.name });
      })
      addListenerOnSelect(response);
    } catch (error) {
      root.innerHTML = error.message;
    }
  }

  function addDataToRepoDetails(data) {
    const repoDetailsDiv = document.getElementById('repo-details');
    repoDetailsDiv.innerHTML = '';
    createAndAppend('div', repoDetailsDiv, { id: "repoNameID" });
    createAndAppend('a', document.getElementById("repoNameID"), { href: data.html_url, target: "_blank", text: data.name })
    createAndAppend('div', repoDetailsDiv, { text: `Repository Description: ${data.description}` });
    createAndAppend('div', repoDetailsDiv, { text: `Number of Forks: ${data.forks}` });
  }

  async function getContributors(data) {
    const contributorsDiv = document.getElementById('contributors');
    contributorsDiv.innerHTML = 'Contributors:';
    try {
      let response = await fetchJSON(data.contributors_url);
      response.forEach(repoObj => {
        let key = repoObj.login;
        createAndAppend('div', contributorsDiv, { id: key });
        createAndAppend('a', document.getElementById(key), { href: repoObj.html_url, target: "_blank", text: key });
      })
    } catch (error) {
      root.innerHTML = error.message;
    }
  }

  function addListenerOnSelect(arrayOfRepoData) {
    document.getElementById('repo-select').addEventListener('change', event => {
      const selectedRepo = event.target.value;
      const selectedData = arrayOfRepoData.filter(repoData => repoData.name === selectedRepo)[0];
      addDataToRepoDetails(selectedData);
      getContributors(selectedData);
    })
  }

  function main() {
    createLayout();
    getRepoDataFromOrgAndAddToDOM();
  }

  window.onload = () => main();
}