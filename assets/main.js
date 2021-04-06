/*! Copyright (c) Undead Labs LLC. All rights reserved. */

var client = "Client has not been initialized!";

$(function () {
    client = ZAFClient.init();

    const initialDate = new Date(Date.now());
    initialDate.setMonth(initialDate.getMonth() - 3);
    const dateInput = document.getElementById("dateInput");
    dateInput.value = initialDate.toISOString().split("T")[0];

    const voteSumInput = document.getElementById("voteSumInput");
    voteSumInput.value = 50;

    showPosts([]);
});

function getTopicPosts(topicId, page, postsPerPage) {
    console.log(`Requesting page ${page}...`);
    return client.request({
        url: `/api/v2/community/topics/${topicId}/posts.json?page=${page}&per_page=${postsPerPage}&sort_by=created_at`,
        type: "GET",
        dataType: "json",
    });
}

async function requestPosts(topicId) {
    $("#content").html("Searching...");

    const dateInput = document.getElementById("dateInput");
    const dateThreshold = new Date(dateInput.value);

    const voteSumInput = document.getElementById("voteSumInput");
    const voteSumThreshold = voteSumInput.value;

    const showThesePosts = [];

    const postsPerPage = 200;

    const starterQuery = await getTopicPosts(topicId, 1, postsPerPage);
    const numPages = starterQuery.page_count;
    // Starting on the last page, get posts & filter out the ones we want.
    for (let page = numPages; page > 0; --page) {
        const progress = (numPages - page) + 1;
        showProgress(`Processing pages (${progress}/${numPages})...`, progress, numPages);

        const data = await getTopicPosts(topicId, page, postsPerPage);
        console.log(data);

        let stopFetching = false;

        data.posts.forEach(p => {
            // If this post is newer than we care about, then we don't need to check any more pages;
            // otherwise, if it's not pinned & has fewer votes than the threshold, add it to the collection.
            const createdAt = new Date(p.created_at);
            if (createdAt > dateThreshold) {
                stopFetching = true;
            }
            else if (p.pinned === false && p.vote_sum < voteSumThreshold) {
                p.created_at_date = createdAt;
                p.created_at_datestr = formatDate(p.created_at);
                p.updated_at_datestr = formatDate(p.updated_at);
                showThesePosts.push(p);
            }

        });

        if (stopFetching) {
            break;
        }
    }

    showThesePosts.sort((a, b) => a.created_at_date < b.created_at_date);

    //360001667252

    showPosts(showThesePosts);
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
        error: response.responseJSON.error,
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
    const source = $("#myposts-template").html();
    const template = Handlebars.compile(source);
    const html = template({ posts });
    $("#content").html(html);
}

function searchButton_OnClick() {
    console.log("Searching...");

    // Gets posts from "360000459952-Wish-List"
    requestPosts("360000459952")
        .catch((exception) => {
            console.error(exception);
            showError(exception);
        });
}

function movePostsButton_OnClick() {
    console.log("!!!!!");
}
