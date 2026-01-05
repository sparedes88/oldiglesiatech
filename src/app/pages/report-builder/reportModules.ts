function getModules() {
  return [
    {
      title: "Contacts",
      fields: [
        {
          title: "Name",
          value: "nombre"
        },
        {
          title: "Last name",
          value: "apellido"
        },
        {
          title: "Phone",
          value: "telefono"
        },
        {
          title: "Email",
          value: "email"
        },
        {
          title: "Membership date",
          value: "fechaMembresia"
        },
        {
          title: "City",
          value: "ciudad"
        },
        {
          title: "Street",
          value: "calle"
        },
        {
          title: "State",
          value: "provincia"
        },
        {
          title: "Zip",
          value: "zip"
        },
        {
          title: "Sex",
          value: "sexo"
        },
        {
          title: "Member Category",
          value: "categories",
          array_field: "name"
        },
        {
          title: "Process In",
          value: "processIn",
          array_field: "name"
        },
        {
          title: "Level In",
          value: "levels",
          array_field: "name",
        },
        {
          title: "Level completed",
          value: "levelsCompleted",
          array_field: "name",
        },
        {
          title: "Level pending",
          value: "levelsPending",
          array_field: "name",
        },
        {
          title: "Steps Completed",
          value: "stepsCompleted",
          array_field: "name",
        },
        {
          title: "Steps pending",
          value: "stepsPending",
          array_field: "name",
        },
        {
          title: "Groups",
          value: "foto",
          array_field: "name"
        },
        {
          title: "Photo",
          value: "foto",
          file: true
        }
      ]
    },
    {
      title: "Groups",
      fields: [
        {
          title: "Group image",
          value: "picture",
          file: true
        },
        {
          title: "Title",
          value: "title"
        },
        {
          title: "Short desc.",
          value: "short_description"
        },
        {
          title: "Long dec.",
          value: "description"
        },
        {
          title: "Street",
          value: "street",
        },
        {
          title: "City",
          value: "city",
        },
        {
          title: "State",
          value: "state",
        },
        {
          title: "Zip",
          value: "zip",
        },
        {
          title: "Group categories",
          value: "categories",
          array_field: 'name'
        },
        {
          title: "Leaders",
          value: "leaders",
          array_field: 'name'
        },
        {
          title: "Group type",
          value: "groupType",
        },
        {
          title: "Members total",
          value: "memeberTotal",
        },
        {
          title: "Type of access",
          value: "nivelAcceso",
        },
        {
          title: "Event date",
          value: "events",
          array_field: 'event_date',
          date: true
        },
        {
          title: "Frequency",
          value: "events",
          array_field: 'frequencyName'
        },
        {
          title: "Week start",
          value: "events",
          array_field: 'start_date',
          date: true
        },
        {
          title: "Days",
          value: "events",
          array_field: 'day',
          date: true
        },
        {
          title: "Time",
          value: "events",
          array_field: 'start_date',
        },
        {
          title: "Title of event in group",
          value: "events",
          array_field: 'name',
        },
        {
          title: "Description of event in group",
          value: "events",
          array_field: 'description',
        },
        {
          title: "Per member in group - contact name",
          value: "members",
          array_field: 'name',
        },
        {
          title: "Per member in group - contact phone",
          value: "members",
          array_field: 'telefono',
        },
        {
          title: "Per member in group - contact email",
          value: "members",
          array_field: 'email',
        },
        {
          title: "Event Activities: Description",
          value: "event_activities",
          array_field: "description"
        },
        {
          title: "Event Activities: Duration",
          value: "event_activities",
          array_field: "event_duration"
        },
        {
          title: "Event Activities: Notes",
          value: "event_activities",
          array_field: "notes"
        },
        {
          title: "Event Activities: Members",
          value: "event_activities",
          array_field: "name"
        },
        {
          title: "Event Activities: Resources",
          value: "event_activities",
          array_field: "resources"
        },
        {
          title: "Event Activities: Time Start",
          value: "event_activities",
          array_field: "time_start"
        },
        {
          title: "Event Activities: Time End",
          value: "event_activities",
          array_field: "time_end"
        },
        {
          title: "Event Reviews: Description",
          value: "event_reviews",
          array_field: "description"
        },
        {
          title: "Event Reviews: Notes",
          value: "event_reviews",
          array_field: "notes"
        },
        {
          title: "Event Reviews: Status",
          value: "event_reviews",
          array_field: "review_status"
        },
        {
          title: "Event Finances: Description",
          value: "event_finances",
          array_field: "description"
        },
        {
          title: "Event Finances: Notes",
          value: "event_finances",
          array_field: "notes"
        },
        {
          title: "Event Finances: Category",
          value: "event_finances",
          array_field: "category_name"
        },
        {
          title: "Event Finances: Is spent",
          value: "event_finances",
          array_field: "is_spent"
        },
        {
          title: "Event Finances: Budget",
          value: "event_finances",
          array_field: "budget"
        },
        {
          title: "Event Finances: Giving",
          value: "event_finances",
          array_field: "giving"
        },
        {
          title: "Event Finances: Spent",
          value: "event_finances",
          array_field: "spent"
        },
        {
          title: "Event Attendance: Member attended",
          value: "event_attendance",
          array_field: "member_attended"
        },
      ]
    },
    {
      title: "Process",
      fields: [
        {
          title: "Name",
          value: "name"
        },
        {
          title: "Description",
          value: "description"
        },
        {
          title: "Level name",
          value: "levels",
          array_field: "name"
        },
        {
          title: "Group",
          value: "groups",
          array_field: "name"
        },
        {
          title: "Category",
          value: "categories",
          array_field: "name"
        },
        {
          title: "Levels",
          value: "levels",
          array_field: "name"
        },
        {
          title: "Steps",
          value: "descripcion",
          array_field: "name"
        },
        {
          title: "People meet requirement",
          value: "peopleMetReqs",
          array_field: "name"
        },
        {
          title: "People Missing requirement",
          value: "peopleMissingReqs",
          array_field: "name"
        },
      ]
    },
  ];
}

export { getModules };
