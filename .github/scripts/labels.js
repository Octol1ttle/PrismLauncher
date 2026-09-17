module.exports = async ({github, context, core}) => {
    if (context.eventName === 'push') {
        await checkPullsForConflicts(github)
        return;
    }
}

async function checkPullsForConflicts(github, context) {
    for await (const pull of github.paginate.iterator(github.rest.pulls.list, {
        owner: context.repository.owner,
        repo: context.repository.name,
        state: 'open'
    })) {
        console.log(pull.mergeable)
    }
}