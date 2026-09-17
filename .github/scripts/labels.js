module.exports = async ({github, context, core}) => {
    const {pr_number} = process.env
    console.log(pr_number)
}