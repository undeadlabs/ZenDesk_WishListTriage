/*! Copyright (c) Undead Labs LLC. All rights reserved. */

// ZenDesk recommends using strings for IDs
// https://developer.zendesk.com/rest_api/docs/help_center/introduction#data-types
const wishListTopicId = "360000459952";
const archiveTopicId = "360001667252";

var client = "Client has not been initialized!";
var searchResultsPosts = [];
var numPostsUpdated = 0;

$(function () {
    client = ZAFClient.init();
    searchResultsPosts = [];

    // Default the input date to 3 months ago.
    const initialDate = new Date(Date.now());
    initialDate.setMonth(initialDate.getMonth() - 3);
    const dateInput = document.getElementById("dateInput");
    dateInput.value = initialDate.toISOString().split("T")[0];

    // Default the input vote sum to 50.
    const voteSumInput = document.getElementById("voteSumInput");
    voteSumInput.value = 50;

    showPosts([]);
});

function searchTopicPosts(topicId, createdBefore, page, postsPerPage) {
    console.log(`Requesting search page ${page}...`);

    // Search posts...
    // https://developer.zendesk.com/rest_api/docs/help_center/search#search-posts
    const q = '""'; // empty query (should match any post)
    return client.request({
        url: `/api/v2/help_center/community_posts/search.json?topic=${topicId}&created_before=${createdBefore}&page=${page}&per_page=${postsPerPage}&query=${q}&sort_by=created_at&sort_order=asc`,
        type: "GET",
        dataType: "json",
    });
}

async function requestPosts(topicId) {
    $("#content").html("Searching...");

    // Reset the collection of results so we don't end up with stale or duplcated posts.
    searchResultsPosts = [];
    numPostsUpdated = 0;

    const dateInput = document.getElementById("dateInput");
    const createdBefore = dateInput.value.split("T")[0];

    const voteSumInput = document.getElementById("voteSumInput");
    const voteSumThreshold = voteSumInput.value;

    const postsPerPage = 100; // Last time I tested, 100 was the maximum allowed.
    for (let page = 1, numPages = 1; page <= numPages; ++page) {
        showProgress(`Searching pages (${page}/${numPages})...`, page, numPages);

        const response = await searchTopicPosts(topicId, createdBefore, page, postsPerPage);
        console.log(response);

        // Update the actual number of pages now that we've gotten a response.
        numPages = response.page_count;

        // Pick out the posts we care about.
        response.results.forEach(p => {
            if (p.featured === false &&
                p.status === "none" &&
                p.vote_sum < voteSumThreshold) {
                // While we're here - generate date strings to show in the results table.
                p.created_at_datestr = formatDate(p.created_at);
                p.updated_at_datestr = formatDate(p.updated_at);

                searchResultsPosts.push(p);
            }
        });
    }

    showPosts(searchResultsPosts);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(
        "en-us",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
}

function showError(response) {
    const error_data = {
        status: response.status,
        statusText: response.statusText,
        error: response.responseJSON?.error ??
        {
            title: "no error title",
            message: "no error message",
        },
        numPostsUpdated,
    };

    const source = $("#error-template").html();
    const template = Handlebars.compile(source);
    const html = template(error_data);
    $("#content").html(html);
}

function showProgress(text, value, max) {
    const source = $("#searchprogress-template").html();
    const template = Handlebars.compile(source);
    const html = template({ text, value, max });
    $("#content").html(html);
}

function showPosts(posts) {
    const source = $("#searchresults-template").html();
    const template = Handlebars.compile(source);
    const html = template({ posts });
    $("#content").html(html);
}

function searchButton_OnClick() {
    console.log("Searching...");

    requestPosts(wishListTopicId)
        .catch((exception) => {
            console.error(exception);
            showError(exception);
        });
}

async function updatePost(post) {
    console.log(`Updating post ${post.id}...`);

    // Update the post with the archive topic ID.
    // https://developer.zendesk.com/rest_api/docs/help_center/posts#update-post
    const payload = {
        post: {
            topic_id: archiveTopicId,
        }
    };

    const response = await client.request({
        url: `https://undeadlabs.zendesk.com/api/v2/community/posts/${post.id}.json`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(payload),
    });

    //console.log(response);

    return response;
}

async function updatePosts(posts) {
    numPostsUpdated = 0;
    const numPosts = posts.length;
    for (let i = 0; i < numPosts; ++i) {
        numPostsUpdated = i + 1;
        showProgress(`Updating posts (${numPostsUpdated}/${numPosts})...`, numPostsUpdated, numPosts);
        await updatePost(posts[i]);
    }

    showProgress(`Update completed (${numPosts}).`, numPosts, numPosts);
}

function movePostsButton_OnClick() {
    updatePosts(searchResultsPosts)
        .catch((exception) => {
            console.error(exception);
            showError(exception);
        });
}
