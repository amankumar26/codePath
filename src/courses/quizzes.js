export const quizzes = {
  "html-intro": [
    {
      "question": "What does HTML stand for?",
      "options": [
        "HyperText Markup Language",
        "HyperText Markdown Language",
        "HyperText Machine Language",
        "HighText Markup Language"
      ],
      "correctIndex": 0
    },
    {
      "question": "Which HTML tag is used for the root element of a webpage?",
      "options": [
        "<body>",
        "<head>",
        "<html>",
        "<root>"
      ],
      "correctIndex": 2
    },
    {
      "question": "Is HTML considered a standard programming language?",
      "options": [
        "Yes, it executes complex logic.",
        "No, it is a markup language used to structure content.",
        "Yes, it has built-in database functions.",
        "No, it is a styling sheet."
      ],
      "correctIndex": 1
    }
  ],
  "html-structure": [
    {
      "question": "Which element acts as the root of an HTML document and wraps all other tags?",
      "options": [
        "<root>",
        "<html>",
        "<body>",
        "<head>"
      ],
      "correctIndex": 1
    },
    {
      "question": "Where should invisible metadata, stylesheets, and page settings be placed?",
      "options": [
        "Inside the <body> element.",
        "Inside the <head> element.",
        "Outside the <html> tag.",
        "In a paragraph tag."
      ],
      "correctIndex": 1
    },
    {
      "question": "Which tag wraps all visible content on a webpage, like headings and text?",
      "options": [
        "<head>",
        "<html>",
        "<body>",
        "<main-content>"
      ],
      "correctIndex": 2
    }
  ],
  "html-headings": [
    {
      "question": "How many standard heading levels does HTML define?",
      "options": [
        "3 levels (h1 to h3)",
        "5 levels (h1 to h5)",
        "6 levels (h1 to h6)",
        "10 levels (h1 to h10)"
      ],
      "correctIndex": 2
    },
    {
      "question": "Which heading tag represents the largest and most important heading?",
      "options": [
        "<h6>",
        "<h1>",
        "<head>",
        "<header>"
      ],
      "correctIndex": 1
    },
    {
      "question": "According to SEO best practices, how many h1 elements should be on a single page?",
      "options": [
        "Only one h1 element.",
        "At least three h1 elements.",
        "As many as you want.",
        "None, headings are bad for SEO."
      ],
      "correctIndex": 0
    }
  ],
  "html-paragraphs": [
    {
      "question": "Which tag defines an HTML paragraph?",
      "options": [
        "<paragraph>",
        "<p>",
        "<text>",
        "<pg>"
      ],
      "correctIndex": 1
    },
    {
      "question": "What happens to multiple consecutive whitespace characters inside a paragraph element?",
      "options": [
        "They are displayed exactly as written.",
        "They cause a syntax error in the browser.",
        "They are collapsed into a single space by the browser.",
        "They are automatically replaced with line breaks."
      ],
      "correctIndex": 2
    },
    {
      "question": "Paragraph elements are block-level. What does this mean?",
      "options": [
        "They start on a new line and take up the full width of the container.",
        "They sit inline next to other elements on the same line.",
        "They cannot contain text, only other tags.",
        "They are invisible by default."
      ],
      "correctIndex": 0
    }
  ],
  "html-links": [
    {
      "question": "Which attribute specifies the destination URL of an anchor (<a>) tag?",
      "options": [
        "link",
        "src",
        "href",
        "action"
      ],
      "correctIndex": 2
    },
    {
      "question": "What does the target=\"_blank\" attribute do on an anchor tag?",
      "options": [
        "Opens the link in the same window/tab.",
        "Opens the link in a new tab or window.",
        "Downloads the linked document.",
        "Hides the anchor text."
      ],
      "correctIndex": 1
    },
    {
      "question": "What is the text between the opening <a> and closing </a> tags called?",
      "options": [
        "Destination tag",
        "Attribute text",
        "Anchor / Link text",
        "Header title"
      ],
      "correctIndex": 2
    }
  ],
  "html-images": [
    {
      "question": "Which attribute specifies the image source path or URL in an <img> tag?",
      "options": [
        "href",
        "path",
        "src",
        "link"
      ],
      "correctIndex": 2
    },
    {
      "question": "What is the purpose of the alt attribute in an image tag?",
      "options": [
        "Specifies the border style of the image.",
        "Provides alternative text description for screen readers and broken links.",
        "Aligns the image to the center of the page.",
        "Links the image to another webpage."
      ],
      "correctIndex": 1
    },
    {
      "question": "Is the <img> tag a self-closing (empty) tag?",
      "options": [
        "Yes, it has no closing tag.",
        "No, it requires a separate </img> tag.",
        "Yes, but you can add </img> optionally.",
        "No, it must be nested in an <img></img> block."
      ],
      "correctIndex": 0
    }
  ],
  "html-unordered-lists": [
    {
      "question": "Which tag is used to create an unordered list?",
      "options": [
        "<ol>",
        "<ul>",
        "<li>",
        "<list>"
      ],
      "correctIndex": 1
    },
    {
      "question": "Which tag represents an item inside a list?",
      "options": [
        "<li>",
        "<item>",
        "<ul>",
        "<ol>"
      ],
      "correctIndex": 0
    },
    {
      "question": "What bullet marker is displayed for an unordered list item by default?",
      "options": [
        "Numbers (1, 2, 3...)",
        "Small black circles (bullets)",
        "Empty squares",
        "Roman numerals"
      ],
      "correctIndex": 1
    }
  ],
  "html-ordered-lists": [
    {
      "question": "Which tag is used to create an ordered list?",
      "options": [
        "<ul>",
        "<li>",
        "<ol>",
        "<dl>"
      ],
      "correctIndex": 2
    },
    {
      "question": "What default markers does an ordered list use?",
      "options": [
        "Alphabetical letters (A, B, C...)",
        "Small black bullet points",
        "Sequential numbers (1, 2, 3...)",
        "Square checkboxes"
      ],
      "correctIndex": 2
    },
    {
      "question": "When should you prefer an ordered list (<ol>) over an unordered list (<ul>)?",
      "options": [
        "When the sequence or ordering of list items is important.",
        "When you want to display items horizontally.",
        "When lists contain anchor links.",
        "Always, unordered lists are obsolete."
      ],
      "correctIndex": 0
    }
  ],
  "html-tables": [
    {
      "question": "Which HTML element defines a row in a table?",
      "options": [
        "<td>",
        "<tr>",
        "<th>",
        "<table>"
      ],
      "correctIndex": 1
    },
    {
      "question": "What is the difference between a <th> element and a <td> element?",
      "options": [
        "<th> is for table rows, <td> is for table divisions.",
        "<th> is for table headers (bold/centered), <td> is for standard data cells.",
        "<th> is only used at the bottom of a table, <td> is used at the top.",
        "They are exactly identical."
      ],
      "correctIndex": 1
    },
    {
      "question": "Which element defines the table container?",
      "options": [
        "<tbody>",
        "<table>",
        "<tr>",
        "<tgrid>"
      ],
      "correctIndex": 1
    }
  ],
  "html-inputs": [
    {
      "question": "Which attribute links a <label> to an <input> element?",
      "options": [
        "id",
        "for",
        "name",
        "type"
      ],
      "correctIndex": 1
    },
    {
      "question": "How is the label's 'for' attribute associated with the input?",
      "options": [
        "It matches the input's name attribute.",
        "It matches the input's type attribute.",
        "It matches the input's id attribute.",
        "It matches the input's placeholder."
      ],
      "correctIndex": 2
    },
    {
      "question": "Which input type is used for entering standard text?",
      "options": [
        "type=\"submit\"",
        "type=\"checkbox\"",
        "type=\"text\"",
        "type=\"radio\""
      ],
      "correctIndex": 2
    }
  ],
  "html-forms": [
    {
      "question": "Which attribute specifies where to send form data on submission?",
      "options": [
        "href",
        "action",
        "method",
        "submit"
      ],
      "correctIndex": 1
    },
    {
      "question": "Which button configuration submits form inputs to the server?",
      "options": [
        "<button type=\"button\">",
        "<button type=\"submit\">",
        "<input type=\"text\">",
        "<a>"
      ],
      "correctIndex": 1
    },
    {
      "question": "Which container tag wraps form inputs and submit handlers?",
      "options": [
        "<form>",
        "<fieldset>",
        "<section>",
        "<button>"
      ],
      "correctIndex": 0
    }
  ]
};
