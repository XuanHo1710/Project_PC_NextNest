#!/usr/bin/env node

/**
 * Migration script to replace Zustand stores with TanStack Query hooks
 * This script will automatically update imports and hook usages
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Store to Hook mapping
const storeToHookMap = {
    'useCategoryStore': {
        import: 'import { useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory, useUpdateManyCategories } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useCategoryStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    // Map old destructured variables to new hooks
                    if (vars.includes('categorys')) {
                        replacements.push('const { data: categorys = [], isLoading: loading } = useCategories(queryParams.toString());');
                    }
                    if (vars.includes('deleteCategory')) {
                        replacements.push('const deleteCategory = useDeleteCategory();');
                    }
                    if (vars.includes('updateCategory')) {
                        replacements.push('const updateCategory = useUpdateCategory();');
                    }
                    if (vars.includes('addCategory')) {
                        replacements.push('const addCategory = useCreateCategory();');
                    }
                    if (vars.includes('updateManyCategory')) {
                        replacements.push('const updateManyCategory = useUpdateManyCategories();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    },
    'useProductStore': {
        import: 'import { useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateManyProducts } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useProductStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    if (vars.includes('products')) {
                        replacements.push('const { data: products = [], isLoading: loading } = useProducts(queryParams.toString());');
                    }
                    if (vars.includes('deleteProduct')) {
                        replacements.push('const deleteProduct = useDeleteProduct();');
                    }
                    if (vars.includes('updateProduct')) {
                        replacements.push('const updateProduct = useUpdateProduct();');
                    }
                    if (vars.includes('addProduct')) {
                        replacements.push('const addProduct = useCreateProduct();');
                    }
                    if (vars.includes('updateManyProduct')) {
                        replacements.push('const updateManyProduct = useUpdateManyProducts();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    },
    'useRoleStore': {
        import: 'import { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, useUpdateManyRoles } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useRoleStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    if (vars.includes('roles')) {
                        replacements.push('const { data: roles = [], isLoading: loading } = useRoles(queryParams.toString());');
                    }
                    if (vars.includes('deleteRole')) {
                        replacements.push('const deleteRole = useDeleteRole();');
                    }
                    if (vars.includes('updateRole')) {
                        replacements.push('const updateRole = useUpdateRole();');
                    }
                    if (vars.includes('addRole')) {
                        replacements.push('const addRole = useCreateRole();');
                    }
                    if (vars.includes('updateManyRole')) {
                        replacements.push('const updateManyRole = useUpdateManyRoles();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    },
    'useEmployeeStore': {
        import: 'import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useUpdateManyEmployees, useEmployeesNoAccount } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useEmployeeStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    if (vars.includes('employees')) {
                        replacements.push('const { data: employees = [], isLoading: loading } = useEmployees(queryParams.toString());');
                    }
                    if (vars.includes('deleteEmployee')) {
                        replacements.push('const deleteEmployee = useDeleteEmployee();');
                    }
                    if (vars.includes('updateEmployee')) {
                        replacements.push('const updateEmployee = useUpdateEmployee();');
                    }
                    if (vars.includes('addEmployee')) {
                        replacements.push('const addEmployee = useCreateEmployee();');
                    }
                    if (vars.includes('updateManyEmployee')) {
                        replacements.push('const updateManyEmployee = useUpdateManyEmployees();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    },
    'useDiscountStore': {
        import: 'import { useDiscounts, useDiscount, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, useUpdateManyDiscounts } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useDiscountStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    if (vars.includes('discounts')) {
                        replacements.push('const { data: discounts = [], isLoading: loading } = useDiscounts(queryParams.toString());');
                    }
                    if (vars.includes('deleteDiscount')) {
                        replacements.push('const deleteDiscount = useDeleteDiscount();');
                    }
                    if (vars.includes('updateDiscount')) {
                        replacements.push('const updateDiscount = useUpdateDiscount();');
                    }
                    if (vars.includes('addDiscount')) {
                        replacements.push('const addDiscount = useCreateDiscount();');
                    }
                    if (vars.includes('updateManyDiscount')) {
                        replacements.push('const updateManyDiscount = useUpdateManyDiscounts();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    },
    'useAccountEmployeeStore': {
        import: 'import { useAccountEmployees, useAccountEmployee, useCreateAccountEmployee, useUpdateAccountEmployee, useDeleteAccountEmployee, useUpdateManyAccountEmployees } from "@/hooks/admin";',
        replacements: [
            {
                from: /const \{ ([^}]*) \} = useAccountEmployeeStore\(\);?/g,
                to: (match, destructured) => {
                    const vars = destructured.split(',').map(v => v.trim());
                    let replacements = [];

                    if (vars.includes('accountEmployees')) {
                        replacements.push('const { data: accountEmployees = [], isLoading: loading } = useAccountEmployees(queryParams.toString());');
                    }
                    if (vars.includes('deleteAccountEmployee')) {
                        replacements.push('const deleteAccountEmployee = useDeleteAccountEmployee();');
                    }
                    if (vars.includes('updateAccountEmployee')) {
                        replacements.push('const updateAccountEmployee = useUpdateAccountEmployee();');
                    }
                    if (vars.includes('addAccountEmployee')) {
                        replacements.push('const addAccountEmployee = useCreateAccountEmployee();');
                    }
                    if (vars.includes('updateManyAccountEmployee')) {
                        replacements.push('const updateManyAccountEmployee = useUpdateManyAccountEmployees();');
                    }

                    return replacements.join('\\n  ');
                }
            }
        ]
    }
};

function migrateFile(filePath) {
    console.log(`Migrating: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Remove old store imports and add new hook imports
    Object.entries(storeToHookMap).forEach(([storeName, config]) => {
        const oldImportRegex = new RegExp(`import.*${storeName}.*from.*["']@/stores/server/.*["'];?`, 'g');

        if (oldImportRegex.test(content)) {
            hasChanges = true;
            content = content.replace(oldImportRegex, config.import);

            // Apply replacements
            config.replacements.forEach(replacement => {
                content = content.replace(replacement.from, replacement.to);
            });
        }
    });

    // Remove useEffect for fetch functions since TanStack Query handles this automatically
    content = content.replace(/useEffect\(\(\) => \{[^}]*fetch[^}]*\}, \[[^}]*\]\);?/g, '');

    // Update delete handlers to use mutateAsync
    content = content.replace(
        /const status = await delete(\w+)\(([^)]+)\);?\s*if \(status !== 500\) \{[^}]*\}/g,
        'await delete$1.mutateAsync($2);'
    );

    // Remove manual toast calls since they're handled in hooks
    content = content.replace(/toast\.(success|error)\([^)]*\);?/g, '');

    if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Migrated: ${filePath}`);
    } else {
        console.log(`⏭️  No changes needed: ${filePath}`);
    }
}

// Find all admin files that might use stores
const adminFiles = glob.sync('src/**/(admin)/**/*.{ts,tsx}', {
    cwd: path.join(__dirname, '..'),
    absolute: true
});

const componentFiles = glob.sync('src/components/**/*.{ts,tsx}', {
    cwd: path.join(__dirname, '..'),
    absolute: true
});

const allFiles = [...adminFiles, ...componentFiles];

console.log(`Found ${allFiles.length} files to check for migration...`);

allFiles.forEach(migrateFile);

console.log('🎉 Migration completed!');