
exports.seed = function (knex) {
  return knex('roles').select().then(roles => {
    return knex('users').insert([   // password
      { 
        username: 'admin', 
        password: "test123", 
        role_id: roles.find(role => role.role === 'ADMIN').id, 
        email: "nkh94@msn.com", 
        city: "Køge", 
        postal_code: "4600", 
        age: "25", 
        profile_text: "Hej",
        profile_image: "#"
      },
    ]);
  });
};
