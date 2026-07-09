const fs = require('fs');

try {
    const filePath = "/home/ubuntu/actions-runner/_work/Project_PC_NextNest/Project_PC_NextNest/pc_gvn_categories_complete_final.json";
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("Total items in JSON:", data.length);

    // Build parent map
    const parentMap = new Map();
    data.forEach(c => {
        const pId = c.parent ? (c.parent._id ? c.parent._id.$oid : null) : null;
        parentMap.set(c._id.$oid, pId);
    });

    // Calculate level depths
    const levels = {};
    data.forEach(c => {
        let depth = 0;
        let current = c._id.$oid;
        while (parentMap.get(current)) {
            depth++;
            current = parentMap.get(current);
        }
        levels[depth] = (levels[depth] || 0) + 1;
    });

    console.log("Levels distribution:", levels);

    // Print level 3 samples (depth = 2)
    const level3 = data.filter(c => {
        let depth = 0;
        let current = c._id.$oid;
        while (parentMap.get(current)) {
            depth++;
            current = parentMap.get(current);
        }
        return depth === 2;
    });

    console.log("Level 3 count:", level3.length);
    console.log("Level 3 samples:", level3.slice(0, 10).map(c => ({
        name: c.name,
        slug: c.slug,
        parentName: c.parent ? c.parent.name : null
    })));
} catch (e) {
    console.error("Error:", e.message);
}
