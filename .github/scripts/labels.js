module.exports = async ({github, context, core}) => {
    console.log('in script')
    const pr_number = process.env.PR_NUMBER
    console.log('the pr number is')
    console.log(PR_NUMBER)
}