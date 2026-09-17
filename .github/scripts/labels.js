module.exports = async ({github, context, core}) => {
    if (context.eventName === 'push') {
        await checkPullsForConflicts(github, context)
        return;
    }
}

const NEEDS_REBASE_LABEL = 'status: needs rebase'
const BASE_BRANCH = 'develop'
const MERGEABLE_WAIT_DELAY = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Adds or removes the 'needs rebase' label depending on whether the pull request is mergeable without conflicts.
 * @param github The Octokit instance
 * @param owner The owner of the repository containing the pull request
 * @param repo The name of the repository containing the pull request
 * @param number The pull request number
 * @returns {Promise<boolean>} A promise returning `true` if the check was successful, or `false` if the pull request should be checked again later.
 */
async function checkPullForConflict(github, owner, repo, number) {
    const {data: pull} = await github.rest.pulls.get({owner, repo, number});

    if (pull.mergeable === null) {
        return false;
    }

    const hasLabel = pull.labels.some(x => x.name === NEEDS_REBASE_LABEL);
    if (pull.mergeable === true && hasLabel) {
        await github.rest.issues.removeLabel({owner, repo, number, name: NEEDS_REBASE_LABEL});
    }
    if (pull.mergeable === false && !hasLabel) {
        await github.rest.issues.addLabels({owner, repo, number, labels: [NEEDS_REBASE_LABEL]});
    }

    return true;
}

async function checkPullsForConflicts(github, context) {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const mergeablePending = []
    for await (const number of github.paginate.iterator(github.rest.pulls.list, {
        owner,
        repo,
        state: 'open',
        base: BASE_BRANCH
    }, (response) => response.data.map(pull => pull.number))) {
        if (!(await checkPullForConflict(github, owner, repo, number))) {
            mergeablePending.push(number);
        }
    }

    let delay = MERGEABLE_WAIT_DELAY;
    while (mergeablePending.length > 0) {
        await sleep(delay);
        delay += MERGEABLE_WAIT_DELAY;

        for (let i = mergeablePending.length - 1; i >= 0; i--) {
            if (await checkPullForConflict(github, owner, repo, mergeablePending[i])) {
                mergeablePending.splice(i, 1);
            }
        }
    }
}