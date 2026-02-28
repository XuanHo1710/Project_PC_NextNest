const { MongoClient } = require('mongodb');
const MONGODB_URI = 'mongodb+srv://xuanhodcbas:0984232310ho.@cluster0.f7sbfkn.mongodb.net/project-pc-hoang-ha';
(async () => {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('project-pc-hoang-ha');

    const counts = {
        products: await db.collection('products').countDocuments(),
        variants: await db.collection('productvariants').countDocuments(),
        brands: await db.collection('brands').countDocuments(),
        attributes: await db.collection('productattributes').countDocuments(),
        attrValues: await db.collection('productattributevalues').countDocuments(),
        allowValues: await db.collection('productattributeallowvalues').countDocuments(),
        categories: await db.collection('categories').countDocuments({ isDeleted: { $ne: true } }),
    };
    console.log('DB Counts:', counts);

    const sample = await db.collection('productvariants').findOne({ combination: { $ne: {} } });
    console.log('\nSample variant combination:', JSON.stringify(sample?.combination));
    console.log('Sample variant price:', sample?.price);

    const withVariants = await db.collection('productvariants').aggregate([
        { $match: { combination: { $ne: {} } } },
        { $group: { _id: '$product', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log('\nProducts with multiple variants:', withVariants.length);

    await client.close();
})();
