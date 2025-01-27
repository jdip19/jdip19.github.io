function genLink(){
    // Get the UL element where you want to add the links
    const projectList = document.getElementById('project-list');
    
    // Define your project folder names
    const projectFolders = ['Meal-Management', 'Front-End', 'IAN','Fig-Plugin','Batch-Files','ClockSheet','my-static-website','hidiary','J-K-Provision'];

    // Iterate over the project folders and create links
    projectFolders.forEach(folderName => {
        const icon =document.createElement('i')
        icon.className="fi fi-rr-arrow-small-right";
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `./projects/${folderName}/index.html`;
        link.textContent = folderName;
        listItem.appendChild(icon)
        listItem.appendChild(link);
        projectList.appendChild(listItem);
    });
}