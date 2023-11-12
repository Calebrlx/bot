const { Octokit } = require("@octokit/rest"); // Need to import

// Create a new octokit instance with your personal access token
const octokit = new Octokit({ auth: `your-personal-access-token` });

// Define the repo parameters
const owner = 'Calebrlx';
const repo = 'Blog';
const blogContentPath = 'blog/apps/blog/_content/AI/'; // Base directory for blog contents
const manifestPath = 'blog/apps/blog/_content/manifest.json'; // Path for the manifest file

// Function to create a new .md file in the specified path with the given content
async function createNewBlogFile(fileName, fileContent) {
    const commitMessage = 'Added Blog'
    const fullPath = `${blogContentPath}${fileName}.md`; // Construct the full file path
    const contentEncoded = Buffer.from(fileContent).toString('base64'); // Encode content to Base64

    try {
        // Create a new file with the given content
        const createResponse = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: fullPath,
            message: commitMessage,
            content: contentEncoded,
        });

        console.log("File created:", createResponse.data);
        return createResponse.data;
    } catch (error) {
        console.error("Error creating new blog file:", error);
        throw error;
    }
}

// Function to update the manifest.json file
async function updateManifestFile(newPost) {
    try {
        // Get the current content of the manifest.json file
        const getResponse = await octokit.repos.getContent({
            owner,
            repo,
            path: manifestPath,
        });
        const sha = getResponse.data.sha;
        const manifestContent = Buffer.from(getResponse.data.content, 'base64').toString('utf8');
        const manifest = JSON.parse(manifestContent);

        // Update the manifest with the new post
        manifest.posts.push(newPost);
        const updatedContentEncoded = Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64');

        // Update the manifest.json file
        const updateResponse = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: manifestPath,
            message: "Updated manifest with new blog post",
            content: updatedContentEncoded,
            sha, // SHA is required to update the file
        });

        console.log("Manifest updated:", updateResponse.data);
        return updateResponse.data;
    } catch (error) {
        console.error("Error updating manifest file:", error);
        throw error;
    }
}

module.exports = {
    createNewBlogFile,
    updateManifestFile,
};


/*

const { Octokit } = require("@octokit/rest"); // Need to import

// Create a new octokit instance with your personal access token
const octokit = new Octokit({ auth: `your-personal-access-token` });

// Define the repo parameters
const owner = 'Calebrlx';
const repo = 'Blog';
const path = 'blog/apps/blog/_content/AI/'; // e.g., 'folder/file.txt'
const message = 'Added Blog'; // e.g., 'Updated file.txt'

// This is your file content, encoded in Base64
const content = Buffer.from('Your new file content').toString('base64');

// To add or modify a file, you would use the octokit.repos.createOrUpdateFileContents method
async function createOrUpdateFile() {
    try {
        // First, try to get the file to see if it exists and to get the SHA to update
        const getFileResponse = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });
        
        const sha = getFileResponse.data.sha; // Capture the SHA if the file exists

        // If the file exists, update it with the new content
        const updateResponse = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content,
            sha, // SHA is required to update the file
        });

        console.log(updateResponse.data);
    } catch (error) {
        // If the file does not exist, create it
        if (error.status === 404) {
            const createResponse = await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content, // No SHA is needed to create a new file
            });

            console.log(createResponse.data);
        } else {
            // Handle any other errors
            console.error('Error:', error);
        }
    }
}

// Call the function
createOrUpdateFile();

*/