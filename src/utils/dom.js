/**
 * DOM utility functions
 */

export const $ = (selector) => document.querySelector(selector);

export const $$ = (selector) => [...document.querySelectorAll(selector)];

export const createElement = (tag, className) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
};
