// utils/prompts.js

// Lista domyślnych promptów
const defaultPrompts = [
    'Napisz funkcję sortującą w JavaScript.',
    'Stwórz klasę w Pythonie do zarządzania kontami użytkowników.',
    'Zaimplementuj algorytm przeszukiwania BFS w C++.',
    'Zbuduj prostą stronę internetową z użyciem HTML i CSS.',
  ];
  
  // Lista szablonów promptów (bardziej złożone zapytania)
  const promptTemplates = [
    {
      title: 'Stwórz API REST w Node.js (proste)',
      template: 'Stwórz API REST w Node.js z jednym endpointem {endpoint}.',
      variables: ['endpoint'],
    },
    {
      title: 'Stwórz API REST w Node.js (rozbudowane)',
      template: 'Stwórz API REST w Node.js z wykorzystaniem Express. API powinno obsługiwać następujące endpointy: {endpointy}. Użyj MongoDB jako bazy danych i dodaj obsługę JWT.',
      variables: ['endpointy'],
    },
  ];
  
  
  
  module.exports = { defaultPrompts, promptTemplates };
  