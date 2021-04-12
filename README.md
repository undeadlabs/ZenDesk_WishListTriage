# ![Logo](app/assets/logo-small.png)&nbsp;Zendesk Wish List Triage app

This is a [Zendesk app](https://develop.zendesk.com/hc/en-us/categories/360000003408) for managing the Wish List on the [SoD2 community](https://support.stateofdecay.com/hc/en-us/community/topics) site.

It allows searching the [Wish List topic](https://support.stateofdecay.com/hc/en-us/community/topics/360000459952) for posts and then moving those results to the [Wish List Archive topic](https://support.stateofdecay.com/hc/en-us/community/topics/360001667252).

## Usage in the Wild

If you have admin access to the [Undead Labs support center](https://undeadlabs.zendesk.com/),<br>
then the app should be available in the tool bar on the left (or this [link](https://undeadlabs.zendesk.com/agent/apps/wish-list-triage)).

## Development

Developing Zendesk apps like this requires a bit of initial setup, but is pretty smooth &amp; painless afterward.<br>
At the time of this writing, their official documenation was quite good at instructing how to develop &amp; test everything.<br>
The only gotcha that might present itself with this repo is that the actual app files live in the `app` directory (and this is where `ZAT` commands for dev &amp; testing should be run).<br>
The reason we have an `app` directory is for the benefit of keeping files unrelated to the final, packaged app out of that product (i.e. this README for GitHub, source files for art, etc.).
