const mysql = require('mysql2');
const inquirer = require('inquirer');
const { printTable } = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; 
    port: 3306,
  
    //  username
    user: "root",
  
    // password
    password: "posole510",
    database: "employee_db"
  });
  //Starts program.
init = () => {
  console.log("Welcome to your Employee Database!")
  console.log("Please Select an Option.")
  return inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do?",
        name: "job",
        choices:["View", "Add", "Update","Exit"]
    }

//Depending on choice, will run following, else ends.
]).then(choices =>{
    if(choices.job ==="View"){
        View();
    }
    else if (choices.job === "Add") {
        Add();
    }
    else if(choices.job ==="Update"){
      Update();
    }
    else { 
      connection.end();
      return;
    }
})
}
//Gives various of ADD options, runs corresponding fucnction.
Add = () =>{
  return inquirer.prompt([
    {
        type: "list",
        message: "What would you like to add?",
        name: "db",
        choices:["Department", "Role", "Employee"]
    }


]).then(choices =>{
  if (choices.db ==="Department"){
    addDepartment();
  }
  else if (choices.db ==="Role"){
    addRole();
  }
  else{
    addEmployee();
  }
})
}
addDepartment = () =>{
  return inquirer.prompt([
    {
      name: 'name',
      message: 'What is the Department name?',
      type: 'input'
    }
    //Creates department, based on user info, then returns back to beginning.
  ]).then(function ({ name }) {
    connection.query(`INSERT INTO department (name) VALUES ('${name}')`, function (err, data) {
        if (err) throw err;
        console.log(`Added`)
        init();
    })
})
}

addRole = () =>{
  let departments = []

  connection.query(`SELECT * FROM department`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) { // Loops through and finds the name of all the departments
          departments.push(data[i].name)

      }
  return inquirer.prompt([
    {
      name: "title",
      message: "What is the name of the role?",
      type: "input",

    },
    {
      name: "salary",
      message: "How much is there salary?",
      type: "input"
    },
    {
      name: "department_id",
      message: "Which department does this role belong to?",
      type: "list",
      choices: departments

    }
    //Adds role to the department.
  ]).then(function ({ title, salary, department_id }) {
      let index = departments.indexOf(department_id)

      connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', ${index})`, function (err, data) {
          if (err) throw err;
          console.log(`Added Role`)
          init();
      })
  })
})
}

addEmployee = () =>{
  let employees = [];
  let roles = [];

  connection.query(`SELECT * FROM role`, function (err, data) {
      if (err) throw err;


      for (let i = 0; i < data.length; i++) {
          roles.push(data[i].title);
      }

      connection.query(`SELECT * FROM employee`, function (err, data) {
          if (err) throw err;

          for (let i = 0; i < data.length; i++) {
              employees.push(data[i].first_name);
          }

          inquirer
              .prompt([
                  {
                      name: 'first_name',
                      message: "what's the employees First Name",
                      type: 'input'
                  },
                  {
                      name: 'last_name',
                      message: 'What is their last name?',
                      type: 'input',
                  },
                  {
                      name: 'role_id',
                      message: 'What is their role?',
                      type: 'list',
                      choices: roles,
                  },
                  {
                      name: 'manager_id',
                      message: "Who is their manager?",
                      type: 'list',
                      choices: ['none'].concat(employees)
                  }
                  //Adds employee
              ]).then(function ({ first_name, last_name, role_id, manager_id }) {
                  let queryText = `INSERT INTO employee (first_name, last_name, role_id`;
                  if (manager_id != 'none') {
                      queryText += `, manager_id) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id)}, ${employees.indexOf(manager_id) + 1})`
                  } else {
                      queryText += `) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id) + 1})`
                  }
                  console.log(queryText)

                  connection.query(queryText, function (err, data) {
                      if (err) throw err;

                      init();
                  })
              })

      })
  })}

View = () =>{
  return inquirer.prompt([
    {
        type: "list",
        message: "What would you like to view?",
        name: "db",
        choices:["department", "role", "employee"]
    }

//Selects Table user wants to see.
]).then(function ({ db }) {
  connection.query(`SELECT * FROM ${db}`, function (err, data) {
      if (err) throw err;

      console.table(data)
      init();
  })
})
}


Update = () =>{
  
  return inquirer.prompt([
    {
        type: "list",
        message: "What would you like to update?",
        name: "db",
        choices:["Role", "Manager"]
    }


]).then(choices =>{

   if (choices.db ==="Role"){
    updateRole();
  }
  //Work in progress.
  else{
    console.log("Not available yet")
    init();
  }
})
}

updateRole = () => {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    let employees = [];
    let roles = [];
    //Pulls all employee first name.
    for (let i = 0; i < data.length; i++) {
        employees.push(data[i].first_name)
    }
    //Pulls all roles.
    connection.query(`SELECT * FROM role`, function (err, data) {
        if (err) throw err;

        for (let i = 0; i < data.length; i++) {
            roles.push(data[i].title)
        }

  return inquirer.prompt([
    {
      name: "employee_id",
      message: "Who's role needs an update?",
      type: "list",
      choices: employees
    },
    {
      name: "role_id",
      message: "What is their role now?",
      type: "list",
      choices: roles
    }
  ])
  .then(function ({ employee_id, role_id }) {
    //UPDATE `table_name` SET `column_name` = `new_value' [WHERE condition]
    connection.query(`UPDATE employee SET role_id = ${roles.indexOf(role_id) + 1} WHERE id = ${employees.indexOf(employee_id) + 1}`, function (err, data) {
        if (err) throw err;

        init();
    })
})
})

})
}

init();
